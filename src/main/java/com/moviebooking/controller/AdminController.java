package com.moviebooking.controller;

import com.moviebooking.entity.User;
import com.moviebooking.entity.User.UserRole;
import com.moviebooking.repository.UserRepository;
import com.moviebooking.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
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
@RequestMapping("/api/admin")
@CrossOrigin(origins = "http://localhost:5173")
@Tag(name = "Admin Management", description = "APIs for Super Admin to manage admin users")
public class AdminController {

  @Autowired
  private UserRepository userRepository;

  @Autowired
  private AuthService authService;

  // Helper method to validate Super Admin access
  private boolean validateSuperAdminAccess(String authHeader) {
    if (authHeader == null || !authHeader.startsWith("Bearer ")) {
      return false;
    }

    String token = authHeader.substring(7);
    User user = authService.validateToken(token);
    return user != null && user.getRole() == UserRole.SUPER_ADMIN;
  }

  @GetMapping("/admins")
  @Operation(summary = "Get all admin users", description = "Retrieve all admin users (Super Admin only)")
  @ApiResponses(value = {
      @ApiResponse(responseCode = "200", description = "Successfully retrieved admin users", content = @Content(mediaType = "application/json", schema = @Schema(implementation = User.class))),
      @ApiResponse(responseCode = "401", description = "Unauthorized - Super Admin access required"),
      @ApiResponse(responseCode = "500", description = "Internal server error")
  })
  public ResponseEntity<List<User>> getAllAdmins(
      @Parameter(description = "Authorization header with Bearer token", required = true) @RequestHeader("Authorization") String authHeader) {
    try {
      if (!validateSuperAdminAccess(authHeader)) {
        return ResponseEntity.status(401).build();
      }

      List<User> admins = userRepository.findByRole(UserRole.ADMIN);
      return ResponseEntity.ok(admins);
    } catch (Exception e) {
      return ResponseEntity.status(500).build();
    }
  }

  @GetMapping("/admins/{id}")
  @Operation(summary = "Get admin by ID", description = "Retrieve a specific admin user by ID (Super Admin only)")
  @ApiResponses(value = {
      @ApiResponse(responseCode = "200", description = "Successfully retrieved admin user", content = @Content(mediaType = "application/json", schema = @Schema(implementation = User.class))),
      @ApiResponse(responseCode = "401", description = "Unauthorized - Super Admin access required"),
      @ApiResponse(responseCode = "404", description = "Admin user not found"),
      @ApiResponse(responseCode = "500", description = "Internal server error")
  })
  public ResponseEntity<User> getAdminById(
      @Parameter(description = "Authorization header with Bearer token", required = true) @RequestHeader("Authorization") String authHeader,
      @Parameter(description = "Admin user ID", required = true) @PathVariable Long id) {
    try {
      if (!validateSuperAdminAccess(authHeader)) {
        return ResponseEntity.status(401).build();
      }

      Optional<User> admin = userRepository.findById(id);
      if (admin.isPresent() && admin.get().getRole() == UserRole.ADMIN) {
        return ResponseEntity.ok(admin.get());
      } else {
        return ResponseEntity.notFound().build();
      }
    } catch (Exception e) {
      return ResponseEntity.status(500).build();
    }
  }

  @PostMapping("/admins")
  @Operation(summary = "Create new admin user", description = "Create a new admin user (Super Admin only)")
  @ApiResponses(value = {
      @ApiResponse(responseCode = "200", description = "Admin user created successfully", content = @Content(mediaType = "application/json", schema = @Schema(implementation = User.class))),
      @ApiResponse(responseCode = "401", description = "Unauthorized - Super Admin access required"),
      @ApiResponse(responseCode = "400", description = "Invalid input data or email already exists"),
      @ApiResponse(responseCode = "500", description = "Internal server error")
  })
  public ResponseEntity<User> createAdmin(
      @Parameter(description = "Authorization header with Bearer token", required = true) @RequestHeader("Authorization") String authHeader,
      @Parameter(description = "Admin user object", required = true) @RequestBody User adminUser) {
    try {
      if (!validateSuperAdminAccess(authHeader)) {
        return ResponseEntity.status(401).build();
      }

      // Check if email already exists
      if (userRepository.findByEmail(adminUser.getEmail()).isPresent()) {
        return ResponseEntity.badRequest().build();
      }

      // Ensure the user is created as ADMIN role
      adminUser.setRole(UserRole.ADMIN);
      adminUser.setActive(true);
      adminUser.setCreatedAt(LocalDateTime.now());

      // Store password in AuthService and set placeholder in entity
      String password = adminUser.getPassword();
      adminUser.setPassword("[STORED_IN_AUTH_SERVICE]");

      User savedAdmin = userRepository.save(adminUser);

      // Store password in AuthService's password store
      authService.addPasswordToStore(adminUser.getEmail().toLowerCase(), password);
      return ResponseEntity.ok(savedAdmin);
    } catch (Exception e) {
      return ResponseEntity.status(500).build();
    }
  }

  @PutMapping("/admins/{id}")
  @Operation(summary = "Update admin user", description = "Update an existing admin user (Super Admin only)")
  @ApiResponses(value = {
      @ApiResponse(responseCode = "200", description = "Admin user updated successfully", content = @Content(mediaType = "application/json", schema = @Schema(implementation = User.class))),
      @ApiResponse(responseCode = "401", description = "Unauthorized - Super Admin access required"),
      @ApiResponse(responseCode = "404", description = "Admin user not found"),
      @ApiResponse(responseCode = "400", description = "Invalid input data"),
      @ApiResponse(responseCode = "500", description = "Internal server error")
  })
  public ResponseEntity<User> updateAdmin(
      @Parameter(description = "Authorization header with Bearer token", required = true) @RequestHeader("Authorization") String authHeader,
      @Parameter(description = "Admin user ID", required = true) @PathVariable Long id,
      @Parameter(description = "Updated admin user object", required = true) @RequestBody User adminDetails) {
    try {
      if (!validateSuperAdminAccess(authHeader)) {
        return ResponseEntity.status(401).build();
      }

      Optional<User> adminOptional = userRepository.findById(id);
      if (adminOptional.isPresent() && adminOptional.get().getRole() == UserRole.ADMIN) {
        User admin = adminOptional.get();
        admin.setFirstName(adminDetails.getFirstName());
        admin.setLastName(adminDetails.getLastName());
        admin.setEmail(adminDetails.getEmail());
        admin.setActive(adminDetails.isActive());

        // Only update password if provided
        if (adminDetails.getPassword() != null && !adminDetails.getPassword().trim().isEmpty()) {
          // Store new password in AuthService
          authService.addPasswordToStore(admin.getEmail().toLowerCase(), adminDetails.getPassword());
        }

        User updatedAdmin = userRepository.save(admin);
        return ResponseEntity.ok(updatedAdmin);
      } else {
        return ResponseEntity.notFound().build();
      }
    } catch (Exception e) {
      return ResponseEntity.status(500).build();
    }
  }

  @PatchMapping("/admins/{id}/status")
  @Operation(summary = "Toggle admin status", description = "Activate or deactivate an admin user (Super Admin only)")
  @ApiResponses(value = {
      @ApiResponse(responseCode = "200", description = "Admin status updated successfully", content = @Content(mediaType = "application/json", schema = @Schema(implementation = User.class))),
      @ApiResponse(responseCode = "401", description = "Unauthorized - Super Admin access required"),
      @ApiResponse(responseCode = "404", description = "Admin user not found"),
      @ApiResponse(responseCode = "400", description = "Invalid input data"),
      @ApiResponse(responseCode = "500", description = "Internal server error")
  })
  public ResponseEntity<User> toggleAdminStatus(
      @Parameter(description = "Authorization header with Bearer token", required = true) @RequestHeader("Authorization") String authHeader,
      @Parameter(description = "Admin user ID", required = true) @PathVariable Long id,
      @Parameter(description = "Status object with active field", required = true) @RequestBody Map<String, Boolean> statusMap) {
    try {
      if (!validateSuperAdminAccess(authHeader)) {
        return ResponseEntity.status(401).build();
      }

      Optional<User> adminOptional = userRepository.findById(id);
      if (adminOptional.isPresent() && adminOptional.get().getRole() == UserRole.ADMIN) {
        User admin = adminOptional.get();
        admin.setActive(statusMap.get("active"));
        User updatedAdmin = userRepository.save(admin);
        return ResponseEntity.ok(updatedAdmin);
      } else {
        return ResponseEntity.notFound().build();
      }
    } catch (Exception e) {
      return ResponseEntity.status(500).build();
    }
  }

  @DeleteMapping("/admins/{id}")
  @Operation(summary = "Delete admin user", description = "Delete an admin user from the system (Super Admin only)")
  @ApiResponses(value = {
      @ApiResponse(responseCode = "204", description = "Admin user deleted successfully"),
      @ApiResponse(responseCode = "401", description = "Unauthorized - Super Admin access required"),
      @ApiResponse(responseCode = "404", description = "Admin user not found"),
      @ApiResponse(responseCode = "500", description = "Internal server error")
  })
  public ResponseEntity<Void> deleteAdmin(
      @Parameter(description = "Authorization header with Bearer token", required = true) @RequestHeader("Authorization") String authHeader,
      @Parameter(description = "Admin user ID", required = true) @PathVariable Long id) {
    try {
      if (!validateSuperAdminAccess(authHeader)) {
        return ResponseEntity.status(401).build();
      }

      Optional<User> adminOptional = userRepository.findById(id);
      if (adminOptional.isPresent() && adminOptional.get().getRole() == UserRole.ADMIN) {
        userRepository.delete(adminOptional.get());
        return ResponseEntity.noContent().build();
      } else {
        return ResponseEntity.notFound().build();
      }
    } catch (Exception e) {
      return ResponseEntity.status(500).build();
    }
  }

  @GetMapping("/stats")
  @Operation(summary = "Get admin statistics", description = "Get statistics about admin users (Super Admin only)")
  @ApiResponses(value = {
      @ApiResponse(responseCode = "200", description = "Successfully retrieved admin statistics"),
      @ApiResponse(responseCode = "401", description = "Unauthorized - Super Admin access required"),
      @ApiResponse(responseCode = "500", description = "Internal server error")
  })
  public ResponseEntity<Map<String, Object>> getAdminStats(
      @Parameter(description = "Authorization header with Bearer token", required = true) @RequestHeader("Authorization") String authHeader) {
    try {
      if (!validateSuperAdminAccess(authHeader)) {
        return ResponseEntity.status(401).build();
      }

      long totalAdmins = userRepository.countByRole(UserRole.ADMIN);
      long activeAdmins = userRepository.countByRoleAndActiveTrue(UserRole.ADMIN);
      long inactiveAdmins = totalAdmins - activeAdmins;

      Map<String, Object> stats = Map.of(
          "totalAdmins", totalAdmins,
          "activeAdmins", activeAdmins,
          "inactiveAdmins", inactiveAdmins);

      return ResponseEntity.ok(stats);
    } catch (Exception e) {
      return ResponseEntity.status(500).build();
    }
  }
}