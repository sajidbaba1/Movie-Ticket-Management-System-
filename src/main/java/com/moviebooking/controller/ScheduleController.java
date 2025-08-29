package com.moviebooking.controller;

import com.moviebooking.entity.Schedule;
import com.moviebooking.entity.User;
import com.moviebooking.entity.ApprovalRequest;
import com.moviebooking.entity.EventLog;
import com.moviebooking.repository.ScheduleRepository;
import com.moviebooking.repository.ApprovalRequestRepository;
import com.moviebooking.repository.EventLogRepository;
import com.moviebooking.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;

@RestController
@RequestMapping("/api/schedules")
@CrossOrigin(origins = "http://localhost:5173")
@Tag(name = "Schedule Management", description = "APIs for managing movie schedules and showtimes")
public class ScheduleController {

  @Autowired
  private ScheduleRepository scheduleRepository;

  @Autowired
  private AuthService authService;

  @Autowired
  private ApprovalRequestRepository approvalRequestRepository;

  @Autowired
  private EventLogRepository eventLogRepository;

  @GetMapping
  @Operation(summary = "Get all schedules", description = "Retrieve a list of all active schedules")
  @ApiResponses(value = {
      @ApiResponse(responseCode = "200", description = "Successfully retrieved schedules", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ScheduleResponse.class))),
      @ApiResponse(responseCode = "500", description = "Internal server error")
  })
  public List<ScheduleResponse> getAllSchedules() {
    return scheduleRepository.findByActiveTrue()
        .stream()
        .filter(s -> s.getTheater() != null && s.getTheater().isApproved() && s.getTheater().isActive())
        .map(ScheduleResponse::from)
        .toList();
  }

  @GetMapping("/{id}")
  @Operation(summary = "Get schedule by ID", description = "Retrieve a specific schedule by its ID")
  @ApiResponses(value = {
      @ApiResponse(responseCode = "200", description = "Successfully retrieved schedule", content = @Content(mediaType = "application/json", schema = @Schema(implementation = Schedule.class))),
      @ApiResponse(responseCode = "404", description = "Schedule not found"),
      @ApiResponse(responseCode = "500", description = "Internal server error")
  })
  public ResponseEntity<Schedule> getScheduleById(
      @Parameter(description = "Schedule ID", required = true) @PathVariable Long id) {
    Optional<Schedule> schedule = scheduleRepository.findById(id);
    return schedule.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
  }

  @GetMapping("/theater/{theaterId}")
  @Operation(summary = "Get schedules by theater", description = "Retrieve all schedules for a specific theater")
  @ApiResponses(value = {
      @ApiResponse(responseCode = "200", description = "Successfully retrieved schedules", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ScheduleResponse.class))),
      @ApiResponse(responseCode = "500", description = "Internal server error")
  })
  public List<ScheduleResponse> getSchedulesByTheater(
      @Parameter(description = "Theater ID", required = true) @PathVariable Long theaterId) {
    return scheduleRepository.findByTheaterIdAndActiveTrue(theaterId)
        .stream()
        .filter(s -> s.getTheater() != null && s.getTheater().isApproved() && s.getTheater().isActive())
        .map(ScheduleResponse::from)
        .toList();
  }

  @GetMapping("/my-schedules")
  @Operation(summary = "Get my schedules", description = "Retrieve all schedules for theaters owned by the authenticated user")
  @ApiResponses(value = {
      @ApiResponse(responseCode = "200", description = "Successfully retrieved schedules", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ScheduleResponse.class))),
      @ApiResponse(responseCode = "401", description = "Unauthorized"),
      @ApiResponse(responseCode = "500", description = "Internal server error")
  })
  public ResponseEntity<List<ScheduleResponse>> getMySchedules(
      @Parameter(description = "Authorization header with Bearer token", required = true) @RequestHeader("Authorization") String authHeader) {
    try {
      if (authHeader == null || !authHeader.startsWith("Bearer ")) {
        return ResponseEntity.status(401).build();
      }

      String token = authHeader.substring(7);
      User user = authService.validateToken(token);

      if (user != null) {
        List<ScheduleResponse> schedules = scheduleRepository.findAll()
            .stream()
            .filter(schedule -> schedule.getTheater() != null
                && schedule.getTheater().getOwner() != null
                && schedule.getTheater().getOwner().getId().equals(user.getId()))
            .map(ScheduleResponse::from)
            .toList();
        return ResponseEntity.ok(schedules);
      } else {
        return ResponseEntity.status(401).build();
      }
    } catch (Exception e) {
      return ResponseEntity.status(500).build();
    }
  }

  @GetMapping("/movie/{movieId}")
  @Operation(summary = "Get schedules by movie", description = "Retrieve all schedules for a specific movie")
  @ApiResponses(value = {
      @ApiResponse(responseCode = "200", description = "Successfully retrieved schedules", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ScheduleResponse.class))),
      @ApiResponse(responseCode = "500", description = "Internal server error")
  })
  public List<ScheduleResponse> getSchedulesByMovie(
      @Parameter(description = "Movie ID", required = true) @PathVariable Long movieId) {
    return scheduleRepository.findByMovieIdAndActiveTrue(movieId)
        .stream()
        .filter(s -> s.getTheater() != null && s.getTheater().isApproved() && s.getTheater().isActive())
        .map(ScheduleResponse::from)
        .toList();
  }

  @GetMapping("/date-range")
  @Operation(summary = "Get schedules by date range", description = "Retrieve schedules within a specific date range")
  @ApiResponses(value = {
      @ApiResponse(responseCode = "200", description = "Successfully retrieved schedules", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ScheduleResponse.class))),
      @ApiResponse(responseCode = "500", description = "Internal server error")
  })
  public List<ScheduleResponse> getSchedulesByDateRange(
      @Parameter(description = "Start date and time", required = true) @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startTime,
      @Parameter(description = "End date and time", required = true) @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endTime) {
    return scheduleRepository.findByShowTimeBetweenAndActiveTrue(startTime, endTime)
        .stream()
        .filter(s -> s.getTheater() != null && s.getTheater().isApproved() && s.getTheater().isActive())
        .map(ScheduleResponse::from)
        .toList();
  }

  @PostMapping
  @Operation(summary = "Create new schedule", description = "Add a new schedule to the system")
  @ApiResponses(value = {
      @ApiResponse(responseCode = "200", description = "Schedule created successfully", content = @Content(mediaType = "application/json", schema = @Schema(implementation = Schedule.class))),
      @ApiResponse(responseCode = "400", description = "Invalid input data"),
      @ApiResponse(responseCode = "500", description = "Internal server error")
  })
  public Schedule createSchedule(
      @Parameter(description = "Schedule object", required = true) @RequestBody Schedule schedule) {
    return scheduleRepository.save(schedule);
  }

  @PutMapping("/{id}")
  @Operation(summary = "Update schedule", description = "Update an existing schedule's information")
  @ApiResponses(value = {
      @ApiResponse(responseCode = "200", description = "Schedule updated successfully", content = @Content(mediaType = "application/json", schema = @Schema(implementation = Schedule.class))),
      @ApiResponse(responseCode = "404", description = "Schedule not found"),
      @ApiResponse(responseCode = "400", description = "Invalid input data"),
      @ApiResponse(responseCode = "500", description = "Internal server error")
  })
  public ResponseEntity<Schedule> updateSchedule(
      @Parameter(description = "Schedule ID", required = true) @PathVariable Long id,
      @Parameter(description = "Updated schedule object", required = true) @RequestBody Schedule scheduleDetails) {
    Optional<Schedule> schedule = scheduleRepository.findById(id);
    if (schedule.isPresent()) {
      Schedule updatedSchedule = schedule.get();
      updatedSchedule.setMovie(scheduleDetails.getMovie());
      updatedSchedule.setTheater(scheduleDetails.getTheater());
      updatedSchedule.setShowTime(scheduleDetails.getShowTime());
      updatedSchedule.setPrice(scheduleDetails.getPrice());
      updatedSchedule.setAvailableSeats(scheduleDetails.getAvailableSeats());
      updatedSchedule.setTotalSeats(scheduleDetails.getTotalSeats());
      updatedSchedule.setScreenNumber(scheduleDetails.getScreenNumber());
      updatedSchedule.setAdditionalInfo(scheduleDetails.getAdditionalInfo());
      updatedSchedule.setActive(scheduleDetails.isActive());
      return ResponseEntity.ok(scheduleRepository.save(updatedSchedule));
    } else {
      return ResponseEntity.notFound().build();
    }
  }

  @PatchMapping("/{id}/status")
  @Operation(summary = "Toggle schedule status", description = "Activate or deactivate a schedule")
  @ApiResponses(value = {
      @ApiResponse(responseCode = "200", description = "Schedule status updated successfully", content = @Content(mediaType = "application/json", schema = @Schema(implementation = Schedule.class))),
      @ApiResponse(responseCode = "404", description = "Schedule not found"),
      @ApiResponse(responseCode = "400", description = "Invalid input data"),
      @ApiResponse(responseCode = "500", description = "Internal server error")
  })
  public ResponseEntity<Schedule> toggleScheduleStatus(
      @Parameter(description = "Schedule ID", required = true) @PathVariable Long id,
      @Parameter(description = "Status object with active field", required = true) @RequestBody Map<String, Boolean> statusMap) {
    Optional<Schedule> schedule = scheduleRepository.findById(id);
    if (schedule.isPresent()) {
      Schedule updatedSchedule = schedule.get();
      updatedSchedule.setActive(statusMap.get("active"));
      return ResponseEntity.ok(scheduleRepository.save(updatedSchedule));
    } else {
      return ResponseEntity.notFound().build();
    }
  }

  @DeleteMapping("/{id}")
  @Operation(summary = "Delete schedule", description = "Delete a schedule from the system")
  @ApiResponses(value = {
      @ApiResponse(responseCode = "204", description = "Schedule deleted successfully"),
      @ApiResponse(responseCode = "404", description = "Schedule not found"),
      @ApiResponse(responseCode = "500", description = "Internal server error")
  })
  public ResponseEntity<Void> deleteSchedule(
      @Parameter(description = "Schedule ID", required = true) @PathVariable Long id) {
    Optional<Schedule> schedule = scheduleRepository.findById(id);
    if (schedule.isPresent()) {
      scheduleRepository.delete(schedule.get());
      return ResponseEntity.noContent().build();
    } else {
      return ResponseEntity.notFound().build();
    }
  }

  // Owner: submit schedule for approval
  @PostMapping("/{id}/submit-for-approval")
  public ResponseEntity<?> submitForApproval(@PathVariable Long id,
                                             @RequestHeader(value = "Authorization", required = false) String authorization) {
    try {
      if (authorization == null || !authorization.startsWith("Bearer ")) {
        return ResponseEntity.status(401).body(java.util.Map.of("message", "Unauthorized"));
      }
      User user = authService.validateToken(authorization.substring(7));
      if (user == null) return ResponseEntity.status(401).body(java.util.Map.of("message", "Unauthorized"));
      Optional<Schedule> opt = scheduleRepository.findById(id);
      if (opt.isEmpty()) return ResponseEntity.status(404).body(java.util.Map.of("message", "Schedule not found"));
      Schedule s = opt.get();
      Schedule.Status from = s.getStatus();
      s.setStatus(Schedule.Status.DRAFT); // ensure draft before submit
      s.setStatus(Schedule.Status.APPROVED == s.getStatus() ? s.getStatus() : Schedule.Status.DRAFT);
      s.setStatus(Schedule.Status.DRAFT); // normalize
      scheduleRepository.save(s);

      ApprovalRequest ar = new ApprovalRequest();
      ar.setEntityType(ApprovalRequest.EntityType.SHOW);
      ar.setEntityId(s.getId());
      ar.setRequestedBy(user);
      approvalRequestRepository.save(ar);

      EventLog ev = new EventLog();
      ev.setEntityType(EventLog.EntityType.SHOW);
      ev.setEntityId(s.getId());
      ev.setUser(user);
      ev.setEventType("SUBMIT");
      ev.setFromStatus(from != null ? from.name() : null);
      ev.setToStatus(s.getStatus().name());
      eventLogRepository.save(ev);

      return ResponseEntity.ok(s);
    } catch (Exception e) {
      return ResponseEntity.status(500).build();
    }
  }

  // Admin: put a schedule on sale (requires approved)
  @PatchMapping("/{id}/on-sale")
  public ResponseEntity<?> setOnSale(@PathVariable Long id,
                                     @RequestHeader(value = "Authorization", required = false) String authorization) {
    try {
      Optional<Schedule> opt = scheduleRepository.findById(id);
      if (opt.isEmpty()) return ResponseEntity.status(404).body(java.util.Map.of("message", "Schedule not found"));
      Schedule s = opt.get();
      if (s.getStatus() != Schedule.Status.APPROVED) {
        return ResponseEntity.badRequest().body(java.util.Map.of("message", "Schedule must be approved before going on sale"));
      }
      Schedule.Status from = s.getStatus();
      s.setStatus(Schedule.Status.ON_SALE);
      scheduleRepository.save(s);
      EventLog ev = new EventLog();
      ev.setEntityType(EventLog.EntityType.SHOW);
      ev.setEntityId(s.getId());
      ev.setUser(getUser(authorization));
      ev.setEventType("ON_SALE");
      ev.setFromStatus(from.name());
      ev.setToStatus(s.getStatus().name());
      eventLogRepository.save(ev);
      return ResponseEntity.ok(s);
    } catch (Exception e) {
      return ResponseEntity.status(500).build();
    }
  }

  // Admin: cancel a schedule
  @PatchMapping("/{id}/cancel")
  public ResponseEntity<?> cancel(@PathVariable Long id,
                                  @RequestHeader(value = "Authorization", required = false) String authorization) {
    try {
      Optional<Schedule> opt = scheduleRepository.findById(id);
      if (opt.isEmpty()) return ResponseEntity.status(404).body(java.util.Map.of("message", "Schedule not found"));
      Schedule s = opt.get();
      Schedule.Status from = s.getStatus();
      s.setStatus(Schedule.Status.CANCELLED);
      scheduleRepository.save(s);
      EventLog ev = new EventLog();
      ev.setEntityType(EventLog.EntityType.SHOW);
      ev.setEntityId(s.getId());
      ev.setUser(getUser(authorization));
      ev.setEventType("CANCEL");
      ev.setFromStatus(from != null ? from.name() : null);
      ev.setToStatus(s.getStatus().name());
      eventLogRepository.save(ev);
      return ResponseEntity.ok(s);
    } catch (Exception e) {
      return ResponseEntity.status(500).build();
    }
  }

  private User getUser(String authorization) {
    if (authorization == null || !authorization.startsWith("Bearer ")) return null;
    return authService.validateToken(authorization.substring(7));
  }

  // Lightweight DTO to avoid serializing lazy proxies for movie/theater
  public static class ScheduleResponse {
    public Long id;
    public Long movieId;
    public String movieTitle;
    public Long theaterId;
    public String theaterName;
    public LocalDateTime showTime;
    public java.math.BigDecimal price;
    public Integer availableSeats;
    public Integer totalSeats;
    public boolean active;
    public LocalDateTime createdAt;
    public String screenNumber;
    public String additionalInfo;

    public static ScheduleResponse from(Schedule s) {
      ScheduleResponse r = new ScheduleResponse();
      r.id = s.getId();
      if (s.getMovie() != null) {
        r.movieId = s.getMovie().getId();
        try { r.movieTitle = s.getMovie().getTitle(); } catch (Exception ignored) {}
      }
      if (s.getTheater() != null) {
        r.theaterId = s.getTheater().getId();
        try { r.theaterName = s.getTheater().getName(); } catch (Exception ignored) {}
      }
      r.showTime = s.getShowTime();
      r.price = s.getPrice();
      r.availableSeats = s.getAvailableSeats();
      r.totalSeats = s.getTotalSeats();
      r.active = s.isActive();
      r.createdAt = s.getCreatedAt();
      r.screenNumber = s.getScreenNumber();
      r.additionalInfo = s.getAdditionalInfo();
      return r;
    }
  }
}