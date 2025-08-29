package com.moviebooking.controller;

import com.moviebooking.entity.Schedule;
import com.moviebooking.entity.User;
import com.moviebooking.repository.ScheduleRepository;
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

  @GetMapping
  @Operation(summary = "Get all schedules", description = "Retrieve a list of all active schedules")
  @ApiResponses(value = {
      @ApiResponse(responseCode = "200", description = "Successfully retrieved schedules", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ScheduleResponse.class))),
      @ApiResponse(responseCode = "500", description = "Internal server error")
  })
  public List<ScheduleResponse> getAllSchedules() {
    return scheduleRepository.findByActiveTrue()
        .stream()
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
}