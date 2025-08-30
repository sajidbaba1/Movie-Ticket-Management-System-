package com.moviebooking.controller;

import com.moviebooking.entity.Booking;
import com.moviebooking.entity.Schedule;
import com.moviebooking.entity.Theater;
import com.moviebooking.entity.User;
import com.moviebooking.repository.BookingRepository;
import com.moviebooking.repository.ScheduleRepository;
import com.moviebooking.service.AuthService;
import com.moviebooking.service.EmailService;
import com.moviebooking.service.NotificationService;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/bookings")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174", "http://localhost:5175"})
public class BookingController {

    private final BookingRepository bookingRepository;
    private final ScheduleRepository scheduleRepository;
    private final AuthService authService;
    private final NotificationService notificationService;
    private final EmailService emailService;

    public BookingController(BookingRepository bookingRepository,
                             ScheduleRepository scheduleRepository,
                             AuthService authService,
                             NotificationService notificationService,
                             EmailService emailService) {
        this.bookingRepository = bookingRepository;
        this.scheduleRepository = scheduleRepository;
        this.authService = authService;
        this.notificationService = notificationService;
        this.emailService = emailService;
    }

    @GetMapping("/my")
    public ResponseEntity<List<BookingResponse>> myBookings(@RequestHeader(name = "Authorization", required = false) String authorization) {
        User user = getUserOrUnauthorized(authorization);
        if (user == null) return ResponseEntity.status(401).build();
        List<BookingResponse> result = bookingRepository.findByUserId(user.getId())
                .stream()
                .map(BookingResponse::from)
                .toList();
        return ResponseEntity.ok(result);
    }

    @PostMapping
    @Transactional
    public ResponseEntity<?> create(@RequestHeader(name = "Authorization", required = false) String authorization,
                                    @RequestBody Map<String, Object> body) {
        User user = getUserOrUnauthorized(authorization);
        if (user == null) return ResponseEntity.status(401).body(Map.of("message", "Unauthorized"));

        Object scheduleIdObj = body.get("scheduleId");
        Object seatsCountObj = body.get("seatsCount");
        if (scheduleIdObj == null || seatsCountObj == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "scheduleId and seatsCount are required"));
        }
        Long scheduleId = Long.valueOf(scheduleIdObj.toString());
        int seatsCount = Integer.parseInt(seatsCountObj.toString());
        if (seatsCount <= 0) {
            return ResponseEntity.badRequest().body(Map.of("message", "seatsCount must be > 0"));
        }

        Optional<Schedule> scheduleOpt = scheduleRepository.findById(scheduleId);
        if (scheduleOpt.isEmpty()) {
            return ResponseEntity.status(404).body(Map.of("message", "Schedule not found"));
        }
        Schedule schedule = scheduleOpt.get();
        // Simple rules: schedule must be active and have enough seats
        if (!schedule.isActive()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Schedule inactive"));
        }
        if (schedule.getAvailableSeats() < seatsCount) {
            return ResponseEntity.badRequest().body(Map.of("message", "Not enough seats available"));
        }

        schedule.setAvailableSeats(schedule.getAvailableSeats() - seatsCount);
        scheduleRepository.save(schedule);

        Booking booking = new Booking();
        booking.setUser(user);
        booking.setSchedule(schedule);
        booking.setSeatsCount(seatsCount);
        BigDecimal total = schedule.getPrice().multiply(BigDecimal.valueOf(seatsCount));
        booking.setTotalAmount(total);
        booking.setStatus(Booking.Status.CREATED);
        Booking saved = bookingRepository.save(booking);

        // Build common context
        String movieTitle = schedule.getMovie() != null ? schedule.getMovie().getTitle() : "Movie";
        String theaterName = schedule.getTheater() != null ? schedule.getTheater().getName() : "Theater";
        String subject = "Booking Confirmed: " + movieTitle;
        String emailBody = "Hi " + (user.getFirstName() != null ? user.getFirstName() : "") + ",\n\n" +
                "Your booking is confirmed.\n" +
                "Movie: " + movieTitle + "\n" +
                "Theater: " + theaterName + "\n" +
                "Show Time: " + schedule.getShowTime() + "\n" +
                "Seats: " + seatsCount + "\n" +
                "Total: " + total + "\n\n" +
                "Thank you for choosing MovieHub!";

        Map<String, Object> data = new HashMap<>();
        data.put("entityType", "BOOKING");
        data.put("entityId", saved.getId());
        data.put("scheduleId", schedule.getId());
        data.put("movieId", schedule.getMovie() != null ? schedule.getMovie().getId() : null);

        // Create notification for customer
        notificationService.create(user,
                "Booking confirmed",
                "You booked " + seatsCount + " seats for " + movieTitle + 
                        " at " + schedule.getShowTime() + ".",
                com.moviebooking.entity.Notification.Type.BOOKING,
                data);
        if (user.getEmail() != null && !user.getEmail().isBlank()) {
            emailService.sendEmail(user.getEmail(), subject, emailBody);
        }

        // Notify theater owner if present
        Theater theater = schedule.getTheater();
        if (theater != null && theater.getOwner() != null) {
            User owner = theater.getOwner();
            notificationService.create(owner,
                    "New booking",
                    user.getFirstName() + " booked " + seatsCount + " seats for " + movieTitle + 
                            " at " + schedule.getShowTime() + ".",
                    com.moviebooking.entity.Notification.Type.BOOKING,
                    data);
            if (owner.getEmail() != null && !owner.getEmail().isBlank()) {
                String ownerBody = "Hello " + (owner.getFirstName() != null ? owner.getFirstName() : "") + ",\n\n" +
                        "A new booking has been made.\n" +
                        "Movie: " + movieTitle + "\n" +
                        "Show Time: " + schedule.getShowTime() + "\n" +
                        "Seats: " + seatsCount + "\n\n" +
                        "Regards, MovieHub";
                emailService.sendEmail(owner.getEmail(), "New Booking - " + movieTitle, ownerBody);
            }
        }

        return ResponseEntity.ok(BookingResponse.from(saved));
    }

    @PatchMapping("/{id}/cancel")
    @Transactional
    public ResponseEntity<?> cancel(@RequestHeader(name = "Authorization", required = false) String authorization,
                                    @PathVariable Long id) {
        User user = getUserOrUnauthorized(authorization);
        if (user == null) return ResponseEntity.status(401).body(Map.of("message", "Unauthorized"));
        Optional<Booking> bookingOpt = bookingRepository.findById(id);
        if (bookingOpt.isEmpty()) return ResponseEntity.status(404).body(Map.of("message", "Booking not found"));
        Booking booking = bookingOpt.get();
        if (!booking.getUser().getId().equals(user.getId())) {
            return ResponseEntity.status(403).body(Map.of("message", "Forbidden"));
        }
        if (booking.getStatus() == Booking.Status.CANCELLED) {
            return ResponseEntity.ok(booking);
        }
        // restore seats
        Schedule schedule = booking.getSchedule();
        schedule.setAvailableSeats(schedule.getAvailableSeats() + booking.getSeatsCount());
        scheduleRepository.save(schedule);

        booking.setStatus(Booking.Status.CANCELLED);
        Booking saved = bookingRepository.save(booking);
        return ResponseEntity.ok(saved);
    }

    private User getUserOrUnauthorized(String authorization) {
        if (authorization == null || !authorization.startsWith("Bearer ")) return null;
        String token = authorization.substring("Bearer ".length());
        return authService.validateToken(token);
    }

    // Lightweight DTOs to avoid lazy-loading serialization issues
    public static class BookingResponse {
        public Long id;
        public String status;
        public java.math.BigDecimal totalAmount;
        public Integer seatsCount;
        public java.time.LocalDateTime createdAt;
        public ScheduleSummary schedule;

        public static BookingResponse from(Booking b) {
            BookingResponse r = new BookingResponse();
            r.id = b.getId();
            r.status = b.getStatus() != null ? b.getStatus().name() : null;
            r.totalAmount = b.getTotalAmount();
            r.seatsCount = b.getSeatsCount();
            r.createdAt = b.getCreatedAt();
            if (b.getSchedule() != null) {
                r.schedule = ScheduleSummary.from(b.getSchedule());
            }
            return r;
        }
    }

    public static class ScheduleSummary {
        public Long id;
        public java.time.LocalDateTime showTime;
        public java.math.BigDecimal price;
        public Long movieId;
        public String movieTitle;
        public Long theaterId;
        public String theaterName;

        public static ScheduleSummary from(Schedule s) {
            ScheduleSummary ss = new ScheduleSummary();
            ss.id = s.getId();
            ss.showTime = s.getShowTime();
            ss.price = s.getPrice();
            if (s.getMovie() != null) {
                ss.movieId = s.getMovie().getId();
                try { ss.movieTitle = s.getMovie().getTitle(); } catch (Exception ignored) {}
            }
            if (s.getTheater() != null) {
                ss.theaterId = s.getTheater().getId();
                try { ss.theaterName = s.getTheater().getName(); } catch (Exception ignored) {}
            }
            return ss;
        }
    }
}
