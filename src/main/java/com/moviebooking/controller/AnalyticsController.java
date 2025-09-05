package com.moviebooking.controller;

import com.moviebooking.entity.Booking;
import com.moviebooking.entity.Schedule;
import com.moviebooking.entity.User;
import com.moviebooking.repository.BookingRepository;
import com.moviebooking.repository.MovieRepository;
import com.moviebooking.repository.ScheduleRepository;
import com.moviebooking.repository.TheaterRepository;
import com.moviebooking.repository.UserRepository;
import com.moviebooking.service.AuthService;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.CopyOnWriteArrayList;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/analytics")
public class AnalyticsController {

    private final BookingRepository bookingRepository;
    private final ScheduleRepository scheduleRepository;
    private final TheaterRepository theaterRepository;
    private final MovieRepository movieRepository;
    private final UserRepository userRepository;
    private final AuthService authService;

    // SSE emitters for real-time analytics updates
    private final List<SseEmitter> emitters = new CopyOnWriteArrayList<>();

    public AnalyticsController(BookingRepository bookingRepository,
                               ScheduleRepository scheduleRepository,
                               TheaterRepository theaterRepository,
                               MovieRepository movieRepository,
                               UserRepository userRepository,
                               AuthService authService) {
        this.bookingRepository = bookingRepository;
        this.scheduleRepository = scheduleRepository;
        this.theaterRepository = theaterRepository;
        this.movieRepository = movieRepository;
        this.userRepository = userRepository;
        this.authService = authService;
    }

    private LocalDateTime[] parseRange(String from, String to) {
        LocalDateTime end = (to != null && !to.isBlank()) ? LocalDate.parse(to).atTime(23,59,59) : LocalDate.now().atTime(23,59,59);
        LocalDateTime start = (from != null && !from.isBlank()) ? LocalDate.parse(from).atStartOfDay() : end.minusDays(29).withHour(0).withMinute(0).withSecond(0);
        return new LocalDateTime[]{start, end};
    }

    private Map<String, Object> summarize(List<Booking> bookings, List<Schedule> schedules) {
        BigDecimal revenue = bookings.stream()
                .filter(b -> b.getStatus() == Booking.Status.PAID)
                .map(Booking::getTotalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        long totalBookings = bookings.size();
        long cancelled = bookings.stream().filter(b -> b.getStatus() == Booking.Status.CANCELLED).count();
        long completed = bookings.stream().filter(b -> b.getStatus() == Booking.Status.PAID).count();

        // Trends by day
        Map<LocalDate, Long> bookingsByDay = bookings.stream()
                .collect(Collectors.groupingBy(b -> b.getCreatedAt().toLocalDate(), TreeMap::new, Collectors.counting()));
        List<Map<String, Object>> trend = bookingsByDay.entrySet().stream().map(e -> {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("date", e.getKey().toString());
            m.put("bookings", e.getValue());
            return m;
        }).collect(Collectors.toList());

        // Revenue trend by day (PAID only)
        Map<LocalDate, BigDecimal> revenueByDay = new TreeMap<>();
        for (Booking b : bookings) {
            if (b.getStatus() == Booking.Status.PAID) {
                LocalDate d = b.getCreatedAt().toLocalDate();
                revenueByDay.put(d, revenueByDay.getOrDefault(d, BigDecimal.ZERO).add(Optional.ofNullable(b.getTotalAmount()).orElse(BigDecimal.ZERO)));
            }
        }
        List<Map<String, Object>> revenueTrend = revenueByDay.entrySet().stream().map(e -> {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("date", e.getKey().toString());
            m.put("revenue", e.getValue());
            return m;
        }).collect(Collectors.toList());

        // Status per day: completed, cancelled, pending
        Map<LocalDate, Map<String, Long>> statusPerDay = new TreeMap<>();
        for (Booking b : bookings) {
            LocalDate d = b.getCreatedAt().toLocalDate();
            Map<String, Long> counts = statusPerDay.computeIfAbsent(d, k -> new HashMap<>(Map.of(
                    "completed", 0L,
                    "cancelled", 0L,
                    "pending", 0L
            )));
            switch (b.getStatus()) {
                case PAID -> counts.put("completed", counts.get("completed") + 1);
                case CANCELLED -> counts.put("cancelled", counts.get("cancelled") + 1);
                default -> counts.put("pending", counts.get("pending") + 1);
            }
        }
        List<Map<String, Object>> statusTrend = statusPerDay.entrySet().stream().map(e -> {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("date", e.getKey().toString());
            Map<String, Long> c = e.getValue();
            m.put("completed", c.getOrDefault("completed", 0L));
            m.put("cancelled", c.getOrDefault("cancelled", 0L));
            m.put("pending", c.getOrDefault("pending", 0L));
            return m;
        }).collect(Collectors.toList());

        // Top movies by revenue
        Map<String, BigDecimal> movieRevenue = new HashMap<>();
        for (Booking b : bookings) {
            try {
                String title = Optional.ofNullable(b.getSchedule()).map(Schedule::getMovie).map(m -> m.getTitle()).orElse("Unknown");
                BigDecimal amt = b.getStatus() == Booking.Status.PAID ? b.getTotalAmount() : BigDecimal.ZERO;
                movieRevenue.put(title, movieRevenue.getOrDefault(title, BigDecimal.ZERO).add(amt));
            } catch (Exception ignored) {}
        }
        List<Map<String, Object>> topMovies = movieRevenue.entrySet().stream()
                .sorted((a,b) -> b.getValue().compareTo(a.getValue()))
                .limit(10)
                .map(e -> {
                    Map<String, Object> m = new LinkedHashMap<>();
                    m.put("title", e.getKey());
                    m.put("revenue", e.getValue());
                    return m;
                })
                .collect(Collectors.toList());

        // Top theaters by revenue
        Map<String, BigDecimal> theaterRevenue = new HashMap<>();
        for (Booking b : bookings) {
            try {
                String name = Optional.ofNullable(b.getSchedule()).map(Schedule::getTheater).map(t -> t.getName()).orElse("Unknown");
                BigDecimal amt = b.getStatus() == Booking.Status.PAID ? b.getTotalAmount() : BigDecimal.ZERO;
                theaterRevenue.put(name, theaterRevenue.getOrDefault(name, BigDecimal.ZERO).add(amt));
            } catch (Exception ignored) {}
        }
        List<Map<String, Object>> topTheaters = theaterRevenue.entrySet().stream()
                .sorted((a,b) -> b.getValue().compareTo(a.getValue()))
                .limit(10)
                .map(e -> {
                    Map<String, Object> m = new LinkedHashMap<>();
                    m.put("name", e.getKey());
                    m.put("revenue", e.getValue());
                    return m;
                })
                .collect(Collectors.toList());

        // Utilization
        int totalSeats = schedules.stream().mapToInt(Schedule::getTotalSeats).sum();
        int soldSeats = schedules.stream().mapToInt(s -> Math.max(0, s.getTotalSeats() - s.getAvailableSeats())).sum();
        double utilization = totalSeats > 0 ? (double) soldSeats / totalSeats : 0.0;

        Map<String, Object> resp = new LinkedHashMap<>();
        Map<String, Object> kpis = new LinkedHashMap<>();
        kpis.put("revenue", revenue);
        kpis.put("bookings", totalBookings);
        kpis.put("completed", completed);
        kpis.put("cancelled", cancelled);
        kpis.put("utilization", utilization);
        resp.put("kpis", kpis);
        resp.put("trend", trend);
        resp.put("revenueTrend", revenueTrend);
        resp.put("statusTrend", statusTrend);
        Map<String, Object> tops = new LinkedHashMap<>();
        tops.put("movies", topMovies);
        tops.put("theaters", topTheaters);
        resp.put("tops", tops);
        return resp;
    }

    @GetMapping("/super-admin")
    @Transactional(readOnly = true)
    public ResponseEntity<?> superAdmin(@RequestHeader(value = "Authorization", required = false) String authorization,
                                        @RequestParam(required = false) String from,
                                        @RequestParam(required = false) String to) {
        User u = getUser(authorization);
        if (u == null) return ResponseEntity.status(401).body(Map.of("message", "Unauthorized"));
        if (u.getRole() != User.UserRole.SUPER_ADMIN && u.getRole() != User.UserRole.ADMIN) {
            return ResponseEntity.status(403).body(Map.of("message", "Forbidden"));
        }
        LocalDateTime[] range = parseRange(from, to);
        List<Booking> bookings = bookingRepository.findByCreatedAtBetween(range[0], range[1]);
        List<Schedule> schedules = scheduleRepository.findByShowTimeBetweenAndActiveTrue(range[0], range[1]);

        Map<String, Object> resp = summarize(bookings, schedules);
        // Add system overview
        Map<String, Object> system = new LinkedHashMap<>();
        system.put("movies", movieRepository.count());
        system.put("theaters", theaterRepository.count());
        system.put("users", userRepository.count());
        resp.put("system", system);
        return ResponseEntity.ok(resp);
    }

    @GetMapping("/owner")
    @Transactional(readOnly = true)
    public ResponseEntity<?> owner(@RequestHeader(value = "Authorization", required = false) String authorization,
                                   @RequestParam(required = false) Long theaterId,
                                   @RequestParam(required = false) String from,
                                   @RequestParam(required = false) String to) {
        User u = getUser(authorization);
        if (u == null) return ResponseEntity.status(401).body(Map.of("message", "Unauthorized"));
        if (u.getRole() != User.UserRole.THEATER_OWNER && u.getRole() != User.UserRole.ADMIN && u.getRole() != User.UserRole.SUPER_ADMIN) {
            return ResponseEntity.status(403).body(Map.of("message", "Forbidden"));
        }
        LocalDateTime[] range = parseRange(from, to);
        List<Booking> bookings;
        List<Schedule> schedules;
        if (theaterId != null) {
            bookings = bookingRepository.findBySchedule_Theater_IdAndCreatedAtBetween(theaterId, range[0], range[1]);
            schedules = scheduleRepository.findByTheaterIdAndShowTimeBetweenAndActiveTrue(theaterId, range[0], range[1]);
        } else {
            bookings = bookingRepository.findByCreatedAtBetween(range[0], range[1]);
            schedules = scheduleRepository.findByShowTimeBetweenAndActiveTrue(range[0], range[1]);
        }
        return ResponseEntity.ok(summarize(bookings, schedules));
    }

    @GetMapping("/customer")
    @Transactional(readOnly = true)
    public ResponseEntity<?> customer(@RequestHeader(value = "Authorization", required = false) String authorization,
                                      @RequestParam Long userId,
                                      @RequestParam(required = false) String from,
                                      @RequestParam(required = false) String to) {
        User u = getUser(authorization);
        if (u == null) return ResponseEntity.status(401).body(Map.of("message", "Unauthorized"));
        if (u.getRole() != User.UserRole.CUSTOMER && u.getRole() != User.UserRole.ADMIN && u.getRole() != User.UserRole.SUPER_ADMIN) {
            return ResponseEntity.status(403).body(Map.of("message", "Forbidden"));
        }
        LocalDateTime[] range = parseRange(from, to);
        List<Booking> bookings = bookingRepository.findByUserIdAndCreatedAtBetween(userId, range[0], range[1]);
        // schedules not critical for customer utilization; provide empty list
        return ResponseEntity.ok(summarize(bookings, Collections.emptyList()));
    }

    // SSE stream endpoint for real-time analytics updates
    @GetMapping(value = "/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter stream(@RequestParam(value = "token", required = false) String token) {
        // Optionally validate token if provided (EventSource cannot set headers)
        if (token != null && !token.isBlank()) {
            try { authService.validateToken(token); } catch (Exception ignored) {}
        }
        SseEmitter emitter = new SseEmitter(0L); // no timeout
        this.emitters.add(emitter);
        emitter.onCompletion(() -> this.emitters.remove(emitter));
        emitter.onTimeout(() -> this.emitters.remove(emitter));
        try {
            emitter.send(SseEmitter.event().name("connected").data(Map.of(
                    "type", "CONNECTED",
                    "at", LocalDateTime.now().toString()
            )));
        } catch (Exception ignored) {}
        return emitter;
    }

    private void broadcast(Object payload) {
        for (SseEmitter emitter : new ArrayList<>(emitters)) {
            try {
                emitter.send(SseEmitter.event().name("analytics").data(Map.of(
                        "type", "ANALYTICS_UPDATE",
                        "payload", payload,
                        "at", LocalDateTime.now().toString()
                )));
            } catch (Exception e) {
                emitter.complete();
                emitters.remove(emitter);
            }
        }
    }

    // Periodically compute super admin summary (last 30 days) and broadcast
    @Scheduled(fixedDelay = 5000)
    public void scheduledBroadcastSuperAdmin() {
        try {
            LocalDateTime end = LocalDate.now().atTime(23,59,59);
            LocalDateTime start = end.minusDays(29).withHour(0).withMinute(0).withSecond(0);
            List<Booking> bookings = bookingRepository.findByCreatedAtBetween(start, end);
            List<Schedule> schedules = scheduleRepository.findByShowTimeBetweenAndActiveTrue(start, end);
            Map<String, Object> payload = summarize(bookings, schedules);
            Map<String, Object> system = new LinkedHashMap<>();
            system.put("movies", movieRepository.count());
            system.put("theaters", theaterRepository.count());
            system.put("users", userRepository.count());
            payload.put("system", system);
            broadcast(payload);
        } catch (Exception ignored) {}
    }

    private User getUser(String authorization) {
        if (authorization == null || !authorization.startsWith("Bearer ")) return null;
        return authService.validateToken(authorization.substring(7));
    }
}
