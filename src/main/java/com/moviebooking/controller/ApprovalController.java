package com.moviebooking.controller;

import com.moviebooking.entity.*;
import com.moviebooking.repository.*;
import com.moviebooking.service.AuthService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/approvals")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174", "http://localhost:5175"})
public class ApprovalController {

    private final ApprovalRequestRepository approvalRepo;
    private final EventLogRepository eventRepo;
    private final TheaterRepository theaterRepo;
    private final MovieRepository movieRepo;
    private final ScheduleRepository scheduleRepo;
    private final AuthService authService;

    public ApprovalController(ApprovalRequestRepository approvalRepo,
                              EventLogRepository eventRepo,
                              TheaterRepository theaterRepo,
                              MovieRepository movieRepo,
                              ScheduleRepository scheduleRepo,
                              AuthService authService) {
        this.approvalRepo = approvalRepo;
        this.eventRepo = eventRepo;
        this.theaterRepo = theaterRepo;
        this.movieRepo = movieRepo;
        this.scheduleRepo = scheduleRepo;
        this.authService = authService;
    }

    @PostMapping("/{type}/{id}/approve")
    public ResponseEntity<?> approve(@RequestHeader(name = "Authorization", required = false) String authorization,
                                     @PathVariable String type,
                                     @PathVariable Long id,
                                     @RequestBody(required = false) Map<String, String> body) {
        User reviewer = getUser(authorization);
        if (reviewer == null) return ResponseEntity.status(401).body(Map.of("message", "Unauthorized"));
        String notes = body != null ? body.getOrDefault("notes", null) : null;

        switch (type.toUpperCase()) {
            case "THEATER" -> {
                Optional<Theater> opt = theaterRepo.findById(id);
                if (opt.isEmpty()) return ResponseEntity.status(404).body(Map.of("message", "Theater not found"));
                Theater t = opt.get();
                Theater.Status from = t.getStatus();
                t.setApproved(true);
                t.setStatus(Theater.Status.APPROVED);
                t.setApprovedBy(reviewer);
                t.setApprovedAt(LocalDateTime.now());
                t.setApprovalNotes(notes);
                theaterRepo.save(t);
                closeApproval(ApprovalRequest.EntityType.THEATER, id, reviewer, true, notes);
                log(EventLog.EntityType.THEATER, id, reviewer, "APPROVE", from, t.getStatus(), notes);
                return ResponseEntity.ok(t);
            }
            case "MOVIE" -> {
                Optional<Movie> opt = movieRepo.findById(id);
                if (opt.isEmpty()) return ResponseEntity.status(404).body(Map.of("message", "Movie not found"));
                Movie m = opt.get();
                Movie.Status from = m.getStatus();
                m.setStatus(Movie.Status.APPROVED);
                m.setApprovedBy(reviewer);
                m.setApprovedAt(LocalDateTime.now());
                m.setApprovalNotes(notes);
                movieRepo.save(m);
                closeApproval(ApprovalRequest.EntityType.MOVIE, id, reviewer, true, notes);
                log(EventLog.EntityType.MOVIE, id, reviewer, "APPROVE", from, m.getStatus(), notes);
                return ResponseEntity.ok(m);
            }
            case "SHOW", "SCHEDULE" -> {
                Optional<Schedule> opt = scheduleRepo.findById(id);
                if (opt.isEmpty()) return ResponseEntity.status(404).body(Map.of("message", "Schedule not found"));
                Schedule s = opt.get();
                Schedule.Status from = s.getStatus();
                s.setStatus(Schedule.Status.APPROVED);
                s.setApprovedBy(reviewer);
                s.setApprovedAt(LocalDateTime.now());
                s.setApprovalNotes(notes);
                scheduleRepo.save(s);
                closeApproval(ApprovalRequest.EntityType.SHOW, id, reviewer, true, notes);
                log(EventLog.EntityType.SHOW, id, reviewer, "APPROVE", from, s.getStatus(), notes);
                return ResponseEntity.ok(s);
            }
            default -> {
                return ResponseEntity.badRequest().body(Map.of("message", "Unsupported type"));
            }
        }
    }

    @PostMapping("/{type}/{id}/deny")
    public ResponseEntity<?> deny(@RequestHeader(name = "Authorization", required = false) String authorization,
                                  @PathVariable String type,
                                  @PathVariable Long id,
                                  @RequestBody(required = false) Map<String, String> body) {
        User reviewer = getUser(authorization);
        if (reviewer == null) return ResponseEntity.status(401).body(Map.of("message", "Unauthorized"));
        String notes = body != null ? body.getOrDefault("notes", null) : null;

        switch (type.toUpperCase()) {
            case "THEATER" -> {
                Optional<Theater> opt = theaterRepo.findById(id);
                if (opt.isEmpty()) return ResponseEntity.status(404).body(Map.of("message", "Theater not found"));
                Theater t = opt.get();
                Theater.Status from = t.getStatus();
                t.setStatus(Theater.Status.DRAFT);
                t.setApprovalNotes(notes);
                theaterRepo.save(t);
                closeApproval(ApprovalRequest.EntityType.THEATER, id, reviewer, false, notes);
                log(EventLog.EntityType.THEATER, id, reviewer, "REJECT", from, t.getStatus(), notes);
                return ResponseEntity.ok(t);
            }
            case "MOVIE" -> {
                Optional<Movie> opt = movieRepo.findById(id);
                if (opt.isEmpty()) return ResponseEntity.status(404).body(Map.of("message", "Movie not found"));
                Movie m = opt.get();
                Movie.Status from = m.getStatus();
                m.setStatus(Movie.Status.DRAFT);
                m.setApprovalNotes(notes);
                movieRepo.save(m);
                closeApproval(ApprovalRequest.EntityType.MOVIE, id, reviewer, false, notes);
                log(EventLog.EntityType.MOVIE, id, reviewer, "REJECT", from, m.getStatus(), notes);
                return ResponseEntity.ok(m);
            }
            case "SHOW", "SCHEDULE" -> {
                Optional<Schedule> opt = scheduleRepo.findById(id);
                if (opt.isEmpty()) return ResponseEntity.status(404).body(Map.of("message", "Schedule not found"));
                Schedule s = opt.get();
                Schedule.Status from = s.getStatus();
                s.setStatus(Schedule.Status.DRAFT);
                s.setApprovalNotes(notes);
                scheduleRepo.save(s);
                closeApproval(ApprovalRequest.EntityType.SHOW, id, reviewer, false, notes);
                log(EventLog.EntityType.SHOW, id, reviewer, "REJECT", from, s.getStatus(), notes);
                return ResponseEntity.ok(s);
            }
            default -> {
                return ResponseEntity.badRequest().body(Map.of("message", "Unsupported type"));
            }
        }
    }

    private void closeApproval(ApprovalRequest.EntityType type, Long entityId, User reviewer, boolean approved, String notes) {
        approvalRepo.findAll().stream()
                .filter(a -> a.getEntityType() == type && a.getEntityId().equals(entityId) && a.getStatus() == ApprovalRequest.Status.PENDING)
                .forEach(a -> {
                    a.setStatus(approved ? ApprovalRequest.Status.APPROVED : ApprovalRequest.Status.REJECTED);
                    a.setReviewedBy(reviewer);
                    a.setReviewedAt(LocalDateTime.now());
                    a.setNotes(notes);
                    approvalRepo.save(a);
                });
    }

    private void log(EventLog.EntityType entityType, Long id, User user, String event, Enum<?> from, Enum<?> to, String notes) {
        EventLog log = new EventLog();
        log.setEntityType(entityType);
        log.setEntityId(id);
        log.setUser(user);
        log.setEventType(event);
        log.setFromStatus(from != null ? from.name() : null);
        log.setToStatus(to != null ? to.name() : null);
        log.setNotes(notes);
        eventRepo.save(log);
    }

    private User getUser(String authorization) {
        if (authorization == null || !authorization.startsWith("Bearer ")) return null;
        String token = authorization.substring(7);
        return authService.validateToken(token);
    }
}
