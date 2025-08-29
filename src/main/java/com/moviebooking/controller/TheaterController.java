package com.moviebooking.controller;

import com.moviebooking.entity.Theater;
import com.moviebooking.entity.ApprovalRequest;
import com.moviebooking.entity.EventLog;
import com.moviebooking.entity.User;
import com.moviebooking.repository.TheaterRepository;
import com.moviebooking.repository.ApprovalRequestRepository;
import com.moviebooking.repository.EventLogRepository;
import com.moviebooking.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/theaters")
@CrossOrigin(origins = "http://localhost:5173")
public class TheaterController {

    @Autowired
    private TheaterRepository theaterRepository;

    @Autowired
    private AuthService authService;

    @Autowired
    private ApprovalRequestRepository approvalRequestRepository;

    @Autowired
    private EventLogRepository eventLogRepository;

    // List theaters
    @GetMapping
    public ResponseEntity<List<TheaterResponse>> getAllTheaters(
            @RequestParam(value = "approvedOnly", defaultValue = "false") boolean approvedOnly,
            @RequestParam(value = "activeOnly", defaultValue = "false") boolean activeOnly,
            @RequestParam(value = "city", required = false) String city,
            @RequestParam(value = "ownerId", required = false) Long ownerId
    ) {
        try {
            List<Theater> result;
            if (ownerId != null) {
                result = theaterRepository.findByOwnerId(ownerId);
            } else if (city != null && !city.isBlank()) {
                result = theaterRepository.findByCityAndApprovedTrueAndActiveTrue(city);
            } else if (approvedOnly || activeOnly) {
                result = theaterRepository.findByApprovedTrueAndActiveTrue();
            } else {
                result = theaterRepository.findAll();
            }

            List<TheaterResponse> dtoList = result.stream().map(TheaterResponse::from).toList();
            return ResponseEntity.ok(dtoList);
        } catch (Exception e) {
            return ResponseEntity.status(500).build();
        }
    }

    // Theater detail
    @GetMapping("/{id}")
    public ResponseEntity<Theater> getTheaterById(@PathVariable Long id) {
        try {
            Optional<Theater> t = theaterRepository.findById(id);
            return t.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
        } catch (Exception e) {
            return ResponseEntity.status(500).build();
        }
    }

    // Create theater
    @PostMapping
    public ResponseEntity<Theater> createTheater(
            @RequestBody Theater theater,
            @RequestHeader(value = "Authorization", required = false) String authorization
    ) {
        try {
            // Resolve owner from bearer token if not provided in request
            if (theater.getOwner() == null) {
                if (authorization == null || !authorization.startsWith("Bearer ")) {
                    return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
                }
                String token = authorization.substring("Bearer ".length());
                User current = authService.validateToken(token);
                if (current == null) {
                    return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
                }
                // Only theater owners or admins can create theaters and be set as owners
                if (current.getRole() != User.UserRole.THEATER_OWNER && current.getRole() != User.UserRole.ADMIN) {
                    return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
                }
                theater.setOwner(current);
            }
            // Entity defaults handle booleans; ensure active true if not explicitly provided
            // (Field is primitive boolean with default true in entity)
            Theater saved = theaterRepository.save(theater);
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).build();
        }
    }

    // Update theater
    @PutMapping("/{id}")
    public ResponseEntity<Theater> updateTheater(@PathVariable Long id, @RequestBody Theater theaterDetails) {
        try {
            Optional<Theater> existingOpt = theaterRepository.findById(id);
            if (existingOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }

            Theater existing = existingOpt.get();
            existing.setName(theaterDetails.getName());
            existing.setAddress(theaterDetails.getAddress());
            existing.setCity(theaterDetails.getCity());
            existing.setState(theaterDetails.getState());
            existing.setZipCode(theaterDetails.getZipCode());
            existing.setPhoneNumber(theaterDetails.getPhoneNumber());
            existing.setEmail(theaterDetails.getEmail());
            existing.setTotalScreens(theaterDetails.getTotalScreens());
            existing.setDescription(theaterDetails.getDescription());
            // Optionally update owner if provided
            // (Avoid toggling active/approved here to prevent unintended resets)
            if (theaterDetails.getOwner() != null) existing.setOwner(theaterDetails.getOwner());

            Theater updated = theaterRepository.save(existing);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.status(500).build();
        }
    }

    // Delete theater
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTheater(@PathVariable Long id) {
        try {
            if (!theaterRepository.existsById(id)) {
                return ResponseEntity.notFound().build();
            }
            theaterRepository.deleteById(id);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            return ResponseEntity.status(500).build();
        }
    }

    // Owner: submit theater for approval
    @PostMapping("/{id}/submit-for-approval")
    public ResponseEntity<?> submitForApproval(@PathVariable Long id,
                                               @RequestHeader(value = "Authorization", required = false) String authorization) {
        try {
            if (authorization == null || !authorization.startsWith("Bearer ")) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(java.util.Map.of("message", "Unauthorized"));
            }
            User user = authService.validateToken(authorization.substring(7));
            if (user == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(java.util.Map.of("message", "Unauthorized"));

            Optional<Theater> opt = theaterRepository.findById(id);
            if (opt.isEmpty()) return ResponseEntity.status(404).body(java.util.Map.of("message", "Theater not found"));
            Theater t = opt.get();
            if (t.getOwner() == null || !t.getOwner().getId().equals(user.getId())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(java.util.Map.of("message", "Forbidden"));
            }
            Theater.Status from = t.getStatus();
            t.setStatus(Theater.Status.SUBMITTED);
            theaterRepository.save(t);

            ApprovalRequest ar = new ApprovalRequest();
            ar.setEntityType(ApprovalRequest.EntityType.THEATER);
            ar.setEntityId(t.getId());
            ar.setRequestedBy(user);
            approvalRequestRepository.save(ar);

            EventLog ev = new EventLog();
            ev.setEntityType(EventLog.EntityType.THEATER);
            ev.setEntityId(t.getId());
            ev.setUser(user);
            ev.setEventType("SUBMIT");
            ev.setFromStatus(from != null ? from.name() : null);
            ev.setToStatus(t.getStatus().name());
            eventLogRepository.save(ev);

            return ResponseEntity.ok(t);
        } catch (Exception e) {
            return ResponseEntity.status(500).build();
        }
    }

    // Admin: activate theater
    @PatchMapping("/{id}/activate")
    public ResponseEntity<?> activate(@PathVariable Long id,
                                      @RequestHeader(value = "Authorization", required = false) String authorization) {
        try {
            Optional<Theater> opt = theaterRepository.findById(id);
            if (opt.isEmpty()) return ResponseEntity.status(404).body(java.util.Map.of("message", "Theater not found"));
            Theater t = opt.get();
            Theater.Status from = t.getStatus();
            t.setActive(true);
            t.setStatus(Theater.Status.ACTIVE);
            theaterRepository.save(t);

            EventLog ev = new EventLog();
            ev.setEntityType(EventLog.EntityType.THEATER);
            ev.setEntityId(t.getId());
            ev.setUser(getUser(authorization));
            ev.setEventType("ACTIVATE");
            ev.setFromStatus(from != null ? from.name() : null);
            ev.setToStatus(t.getStatus().name());
            eventLogRepository.save(ev);
            return ResponseEntity.ok(t);
        } catch (Exception e) {
            return ResponseEntity.status(500).build();
        }
    }

    // Admin: deactivate theater
    @PatchMapping("/{id}/deactivate")
    public ResponseEntity<?> deactivate(@PathVariable Long id,
                                        @RequestHeader(value = "Authorization", required = false) String authorization) {
        try {
            Optional<Theater> opt = theaterRepository.findById(id);
            if (opt.isEmpty()) return ResponseEntity.status(404).body(java.util.Map.of("message", "Theater not found"));
            Theater t = opt.get();
            Theater.Status from = t.getStatus();
            t.setActive(false);
            t.setStatus(Theater.Status.INACTIVE);
            theaterRepository.save(t);

            EventLog ev = new EventLog();
            ev.setEntityType(EventLog.EntityType.THEATER);
            ev.setEntityId(t.getId());
            ev.setUser(getUser(authorization));
            ev.setEventType("DEACTIVATE");
            ev.setFromStatus(from != null ? from.name() : null);
            ev.setToStatus(t.getStatus().name());
            eventLogRepository.save(ev);
            return ResponseEntity.ok(t);
        } catch (Exception e) {
            return ResponseEntity.status(500).build();
        }
    }

    private User getUser(String authorization) {
        if (authorization == null || !authorization.startsWith("Bearer ")) return null;
        return authService.validateToken(authorization.substring(7));
    }
    // Toggle active status (to match frontend theaterService.toggleTheaterStatus)
    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Theater> updateTheaterStatus(@PathVariable Long id, @RequestBody StatusRequest statusRequest) {
        try {
            Optional<Theater> existingOpt = theaterRepository.findById(id);
            if (existingOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }
            Theater theater = existingOpt.get();
            theater.setActive(statusRequest.isActive());
            Theater saved = theaterRepository.save(theater);
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            return ResponseEntity.status(500).build();
        }
    }

    // DTO for status updates
    public static class StatusRequest {
        private boolean active;

        public boolean isActive() {
            return active;
        }

        public void setActive(boolean active) {
            this.active = active;
        }
    }

    // Toggle approval status (admin action)
    @PatchMapping("/{id}/approval")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Theater> updateTheaterApproval(@PathVariable Long id, @RequestBody ApprovalToggleRequest approvalRequest) {
        try {
            Optional<Theater> existingOpt = theaterRepository.findById(id);
            if (existingOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }
            Theater theater = existingOpt.get();
            theater.setApproved(approvalRequest.isApproved());
            Theater saved = theaterRepository.save(theater);
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            return ResponseEntity.status(500).build();
        }
    }

    // DTO for approval updates
    public static class ApprovalToggleRequest {
        private boolean approved;

        public boolean isApproved() {
            return approved;
        }

        public void setApproved(boolean approved) {
            this.approved = approved;
        }
    }

    // Lightweight Theater DTO to avoid lazy proxy serialization issues
    public static class TheaterResponse {
        public Long id;
        public String name;
        public String address;
        public String city;
        public String state;
        public String zipCode;
        public String phoneNumber;
        public String email;
        public Integer totalScreens;
        public String description;
        public boolean active;
        public boolean approved;
        public java.time.LocalDateTime createdAt;

        public static TheaterResponse from(Theater t) {
            TheaterResponse r = new TheaterResponse();
            r.id = t.getId();
            r.name = t.getName();
            r.address = t.getAddress();
            r.city = t.getCity();
            r.state = t.getState();
            r.zipCode = t.getZipCode();
            r.phoneNumber = t.getPhoneNumber();
            r.email = t.getEmail();
            r.totalScreens = t.getTotalScreens();
            r.description = t.getDescription();
            r.active = t.isActive();
            r.approved = t.isApproved();
            r.createdAt = t.getCreatedAt();
            return r;
        }
    }
}
