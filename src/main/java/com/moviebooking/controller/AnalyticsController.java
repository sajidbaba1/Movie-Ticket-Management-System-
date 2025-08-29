package com.moviebooking.controller;

import com.moviebooking.entity.Booking;
import com.moviebooking.entity.Schedule;
import com.moviebooking.repository.BookingRepository;
import com.moviebooking.repository.MovieRepository;
import com.moviebooking.repository.ScheduleRepository;
import com.moviebooking.repository.TheaterRepository;
import com.moviebooking.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/analytics")
public class AnalyticsController {

    private final BookingRepository bookingRepository;
    private final ScheduleRepository scheduleRepository;
    private final TheaterRepository theaterRepository;
    private final MovieRepository movieRepository;
    private final UserRepository userRepository;

    public AnalyticsController(BookingRepository bookingRepository,
                               ScheduleRepository scheduleRepository,
                               TheaterRepository theaterRepository,
                               MovieRepository movieRepository,
                               UserRepository userRepository) {
        this.bookingRepository = bookingRepository;
        this.scheduleRepository = scheduleRepository;
        this.theaterRepository = theaterRepository;
        this.movieRepository = movieRepository;
        this.userRepository = userRepository;
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
        Map<String, Object> tops = new LinkedHashMap<>();
        tops.put("movies", topMovies);
        tops.put("theaters", topTheaters);
        resp.put("tops", tops);
        return resp;
    }

    @GetMapping("/super-admin")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    @Transactional(readOnly = true)
    public ResponseEntity<?> superAdmin(@RequestParam(required = false) String from,
                                        @RequestParam(required = false) String to) {
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
    @PreAuthorize("hasRole('THEATER_OWNER')")
    @Transactional(readOnly = true)
    public ResponseEntity<?> owner(@RequestParam(required = false) Long theaterId,
                                   @RequestParam(required = false) String from,
                                   @RequestParam(required = false) String to) {
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
    @PreAuthorize("hasRole('CUSTOMER')")
    @Transactional(readOnly = true)
    public ResponseEntity<?> customer(@RequestParam Long userId,
                                      @RequestParam(required = false) String from,
                                      @RequestParam(required = false) String to) {
        LocalDateTime[] range = parseRange(from, to);
        List<Booking> bookings = bookingRepository.findByUserIdAndCreatedAtBetween(userId, range[0], range[1]);
        // schedules not critical for customer utilization; provide empty list
        return ResponseEntity.ok(summarize(bookings, Collections.emptyList()));
    }
}
