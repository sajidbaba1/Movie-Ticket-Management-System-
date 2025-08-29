package com.moviebooking.controller;

import com.moviebooking.dto.LoginResponse;
import com.moviebooking.entity.User;
import com.moviebooking.repository.UserRepository;
import com.moviebooking.service.AuthService;
import com.moviebooking.service.EmailService;
import com.moviebooking.service.OtpService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth/otp")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174", "http://localhost:5175"})
public class OtpController {

    private final OtpService otpService;
    private final EmailService emailService;
    private final UserRepository userRepository;
    private final AuthService authService;

    public OtpController(OtpService otpService, EmailService emailService, UserRepository userRepository, AuthService authService) {
        this.otpService = otpService;
        this.emailService = emailService;
        this.userRepository = userRepository;
        this.authService = authService;
    }

    @PostMapping("/send")
    public ResponseEntity<Map<String, Object>> send(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        if (email == null || email.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Email is required"));
        }
        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(404).body(Map.of("message", "User not found"));
        }
        if (!userOpt.get().isActive()) {
            return ResponseEntity.status(403).body(Map.of("message", "Account is disabled"));
        }
        String code = otpService.generateOtp(email);
        try {
            emailService.sendOtpEmail(email, code);
            return ResponseEntity.ok(Map.of("message", "OTP sent"));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("message", "Failed to send OTP"));
        }
    }

    @PostMapping("/verify")
    public ResponseEntity<LoginResponse> verify(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        String code = body.get("code");
        if (email == null || code == null) {
            return ResponseEntity.badRequest().build();
        }
        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(404).build();
        }
        if (!otpService.verifyOtp(email, code)) {
            return ResponseEntity.status(401).body(new LoginResponse("Invalid or expired OTP"));
        }
        User user = userOpt.get();
        if (!user.isActive()) {
            return ResponseEntity.status(403).body(new LoginResponse("Account is disabled"));
        }
        String token = authService.generateTokenFor(user);
        return ResponseEntity.ok(new LoginResponse(user, token));
    }
}
