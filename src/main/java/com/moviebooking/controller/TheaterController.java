package com.moviebooking.controller;

import com.moviebooking.entity.Theater;
import com.moviebooking.repository.TheaterRepository;
import org.springframework.beans.factory.annotation.Autowired;
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
    public ResponseEntity<Theater> createTheater(@RequestBody Theater theater) {
        try {
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
    public ResponseEntity<Theater> updateTheaterApproval(@PathVariable Long id, @RequestBody ApprovalRequest approvalRequest) {
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
    public static class ApprovalRequest {
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
