package com.moviebooking.service;

import com.moviebooking.entity.User;
import com.moviebooking.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Service
public class DataInitializationService implements CommandLineRunner {

  @Autowired
  private UserRepository userRepository;

  @Autowired
  private AuthService authService;

  @Override
  public void run(String... args) throws Exception {
    initializeUsers();
  }

  private void initializeUsers() {
    // Check if users already exist
    if (userRepository.count() > 0) {
      System.out.println("Users already exist in database. Skipping initialization.");
      return;
    }

    System.out.println("Initializing database with default users...");

    // Create default users
    createUserIfNotExists("superadmin@moviehub.com", "Super", "Admin", User.UserRole.SUPER_ADMIN, "superadmin123");
    createUserIfNotExists("admin@moviehub.com", "Admin", "User", User.UserRole.ADMIN, "admin123");
    createUserIfNotExists("john.smith@example.com", "John", "Smith", User.UserRole.THEATER_OWNER, "theater123");
    createUserIfNotExists("jane.doe@example.com", "Jane", "Doe", User.UserRole.THEATER_OWNER, "theater123");
    createUserIfNotExists("mike.johnson@example.com", "Mike", "Johnson", User.UserRole.THEATER_OWNER, "theater123");
    createUserIfNotExists("sarah.wilson@example.com", "Sarah", "Wilson", User.UserRole.CUSTOMER, "password123");
    createUserIfNotExists("ss2728303@gmail.com", "SAJID", "SHAIKH", User.UserRole.CUSTOMER, "sajidsai");

    System.out.println("Database initialization completed.");
  }

  private void createUserIfNotExists(String email, String firstName, String lastName, User.UserRole role,
      String password) {
    if (userRepository.findByEmail(email).isEmpty()) {
      User user = new User();
      user.setEmail(email);
      user.setFirstName(firstName);
      user.setLastName(lastName);
      user.setRole(role);
      user.setActive(true);
      user.setCreatedAt(LocalDateTime.now());
      // Set a placeholder password in the entity (actual password is stored in
      // AuthService)
      user.setPassword("[STORED_IN_AUTH_SERVICE]");

      User savedUser = userRepository.save(user);

      // Store password in AuthService's password store
      authService.addPasswordToStore(email.toLowerCase(), password);

      System.out.println("Created user: " + email + " with role: " + role);
    }
  }
}