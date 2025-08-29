package com.moviebooking.controller;

import com.moviebooking.dto.LoginRequest;
import com.moviebooking.dto.LoginResponse;
import com.moviebooking.dto.SignupRequest;
import com.moviebooking.entity.User;
import com.moviebooking.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:5173")
@Tag(name = "Authentication", description = "APIs for user authentication and registration")
public class AuthController {

  @Autowired
  private AuthService authService;

  @PostMapping("/login")
  @Operation(summary = "User Login", description = "Authenticate user with email and password")
  @ApiResponses(value = {
      @ApiResponse(responseCode = "200", description = "Login successful", content = @Content(mediaType = "application/json", schema = @Schema(implementation = LoginResponse.class))),
      @ApiResponse(responseCode = "401", description = "Invalid credentials"),
      @ApiResponse(responseCode = "400", description = "Invalid request data"),
      @ApiResponse(responseCode = "500", description = "Internal server error")
  })
  public ResponseEntity<LoginResponse> login(
      @Parameter(description = "Login credentials", required = true) @Valid @RequestBody LoginRequest loginRequest) {

    try {
      LoginResponse response = authService.login(loginRequest);

      if (response.getUser() != null && response.getToken() != null) {
        return ResponseEntity.ok(response);
      } else {
        return ResponseEntity.status(401).body(response);
      }
    } catch (Exception e) {
      LoginResponse errorResponse = new LoginResponse("Login failed: " + e.getMessage());
      return ResponseEntity.status(500).body(errorResponse);
    }
  }

  @PostMapping("/signup")
  @Operation(summary = "User Registration", description = "Register a new user account")
  @ApiResponses(value = {
      @ApiResponse(responseCode = "201", description = "User registered successfully", content = @Content(mediaType = "application/json", schema = @Schema(implementation = LoginResponse.class))),
      @ApiResponse(responseCode = "409", description = "User already exists"),
      @ApiResponse(responseCode = "400", description = "Invalid request data"),
      @ApiResponse(responseCode = "500", description = "Internal server error")
  })
  public ResponseEntity<LoginResponse> signup(
      @Parameter(description = "User registration data", required = true) @Valid @RequestBody SignupRequest signupRequest) {

    try {
      LoginResponse response = authService.signup(signupRequest);

      if (response.getUser() != null && response.getToken() != null) {
        return ResponseEntity.status(201).body(response);
      } else {
        int statusCode = response.getMessage().contains("already exists") ? 409 : 400;
        return ResponseEntity.status(statusCode).body(response);
      }
    } catch (Exception e) {
      LoginResponse errorResponse = new LoginResponse("Registration failed: " + e.getMessage());
      return ResponseEntity.status(500).body(errorResponse);
    }
  }

  @PostMapping("/validate")
  @Operation(summary = "Validate Token", description = "Validate JWT token and return user information")
  @ApiResponses(value = {
      @ApiResponse(responseCode = "200", description = "Token is valid", content = @Content(mediaType = "application/json", schema = @Schema(implementation = User.class))),
      @ApiResponse(responseCode = "401", description = "Invalid or expired token"),
      @ApiResponse(responseCode = "500", description = "Internal server error")
  })
  public ResponseEntity<?> validateToken(
      @Parameter(description = "Authorization header with Bearer token", required = true) @RequestHeader("Authorization") String authHeader) {

    try {
      if (authHeader == null || !authHeader.startsWith("Bearer ")) {
        return ResponseEntity.status(401).body(Map.of("error", "Missing or invalid Authorization header"));
      }

      String token = authHeader.substring(7); // Remove "Bearer " prefix
      User user = authService.validateToken(token);

      if (user != null) {
        return ResponseEntity.ok(user);
      } else {
        return ResponseEntity.status(401).body(Map.of("error", "Invalid or expired token"));
      }
    } catch (Exception e) {
      return ResponseEntity.status(500).body(Map.of("error", "Token validation failed: " + e.getMessage()));
    }
  }

  @GetMapping("/me")
  @Operation(summary = "Get Current User", description = "Get current user information from JWT token")
  @ApiResponses(value = {
      @ApiResponse(responseCode = "200", description = "User information retrieved successfully", content = @Content(mediaType = "application/json", schema = @Schema(implementation = User.class))),
      @ApiResponse(responseCode = "401", description = "Unauthorized - invalid or missing token"),
      @ApiResponse(responseCode = "500", description = "Internal server error")
  })
  public ResponseEntity<?> getCurrentUser(
      @Parameter(description = "Authorization header with Bearer token", required = true) @RequestHeader("Authorization") String authHeader) {

    return validateToken(authHeader); // Reuse the validate token logic
  }
}