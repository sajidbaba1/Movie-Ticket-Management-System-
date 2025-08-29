package com.moviebooking.service;

import com.moviebooking.dto.LoginRequest;
import com.moviebooking.dto.LoginResponse;
import com.moviebooking.dto.SignupRequest;
import com.moviebooking.entity.User;
import com.moviebooking.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Base64;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@Service
public class AuthService {

  @Autowired
  private UserRepository userRepository;

  // Mock password storage - In production, use proper password hashing
  private final Map<String, String> passwordStore = new HashMap<String, String>() {
    {
      put("superadmin@moviehub.com", "superadmin123");
      put("admin@moviehub.com", "admin123");
      put("sarah.wilson@example.com", "password123");
      put("ss2728303@gmail.com", "sajidsai");
      put("john.smith@example.com", "theater123");
      put("jane.doe@example.com", "theater123");
      put("mike.johnson@example.com", "theater123");
    }
  };

  /**
   * Authenticate user login
   */
  public LoginResponse login(LoginRequest loginRequest) {
    try {
      // Find user by email
      Optional<User> userOptional = userRepository.findByEmail(loginRequest.getEmail());

      if (userOptional.isEmpty()) {
        return new LoginResponse("User not found");
      }

      User user = userOptional.get();

      // Check if user is active
      if (!user.isActive()) {
        return new LoginResponse("Account is disabled");
      }

      // Verify password (in production, use proper password hashing)
      String storedPassword = passwordStore.get(loginRequest.getEmail().toLowerCase());
      if (storedPassword == null || !storedPassword.equals(loginRequest.getPassword())) {
        return new LoginResponse("Invalid credentials");
      }

      // Generate token
      String token = generateToken(user);

      return new LoginResponse(user, token);

    } catch (Exception e) {
      return new LoginResponse("Login failed: " + e.getMessage());
    }
  }

  /**
   * Register new user
   */
  public LoginResponse signup(SignupRequest signupRequest) {
    try {
      // Check if user already exists
      Optional<User> existingUser = userRepository.findByEmail(signupRequest.getEmail());
      if (existingUser.isPresent()) {
        return new LoginResponse("An account with this email already exists");
      }

      // Create new user
      User newUser = new User();
      newUser.setFirstName(signupRequest.getFirstName());
      newUser.setLastName(signupRequest.getLastName());
      newUser.setEmail(signupRequest.getEmail());
      newUser.setRole(User.UserRole.valueOf(signupRequest.getRole()));
      newUser.setActive(true);
      newUser.setCreatedAt(LocalDateTime.now());

      // Save user to database
      User savedUser = userRepository.save(newUser);

      // Store password (in production, hash the password)
      passwordStore.put(signupRequest.getEmail().toLowerCase(), signupRequest.getPassword());

      // Generate token
      String token = generateToken(savedUser);

      return new LoginResponse(savedUser, token);

    } catch (Exception e) {
      return new LoginResponse("Registration failed: " + e.getMessage());
    }
  }

  /**
   * Validate JWT token
   */
  public User validateToken(String token) {
    try {
      // In production, use proper JWT validation
      // For demo purposes, we'll decode the mock token
      String[] parts = token.split("\\.");
      if (parts.length != 3) {
        return null;
      }

      String payload = new String(Base64.getDecoder().decode(parts[1]));

      // Simple parsing - in production use proper JSON parsing
      if (payload.contains("\"userId\":")) {
        String userIdStr = payload.substring(payload.indexOf("\"userId\":") + 9);
        userIdStr = userIdStr.substring(0, userIdStr.indexOf(","));
        Long userId = Long.parseLong(userIdStr);

        Optional<User> userOptional = userRepository.findById(userId);
        return userOptional.orElse(null);
      }

      return null;
    } catch (Exception e) {
      return null;
    }
  }

  /**
   * Generate mock JWT token
   */
  private String generateToken(User user) {
    // Generate a mock JWT-like token (3 parts separated by dots)
    String header = Base64.getEncoder().encodeToString("{\"alg\":\"HS256\",\"typ\":\"JWT\"}".getBytes());

    long exp = System.currentTimeMillis() / 1000 + (24 * 60 * 60); // 24 hours
    String payload = String.format(
        "{\"userId\":%d,\"email\":\"%s\",\"role\":\"%s\",\"exp\":%d}",
        user.getId(), user.getEmail(), user.getRole(), exp);
    String encodedPayload = Base64.getEncoder().encodeToString(payload.getBytes());

    String signature = Base64.getEncoder().encodeToString("mock-signature".getBytes());

    return header + "." + encodedPayload + "." + signature;
  }

  /**
   * Add password to store (for initialization purposes)
   */
  public void addPasswordToStore(String email, String password) {
    passwordStore.put(email.toLowerCase(), password);
  }
}