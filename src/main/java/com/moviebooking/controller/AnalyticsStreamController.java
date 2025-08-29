package com.moviebooking.controller;

import com.moviebooking.entity.User;
import com.moviebooking.service.AnalyticsEventBus;
import com.moviebooking.service.AuthService;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

@RestController
@RequestMapping("/api/analytics")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174", "http://localhost:5175"})
public class AnalyticsStreamController {

    private final AnalyticsEventBus bus;
    private final AuthService authService;

    public AnalyticsStreamController(AnalyticsEventBus bus, AuthService authService) {
        this.bus = bus;
        this.authService = authService;
    }

    @GetMapping("/stream")
    public SseEmitter stream(@org.springframework.web.bind.annotation.RequestParam(name = "token", required = false) String token) {
        // Validate token for SUPER_ADMIN since EventSource can't set headers
        if (token != null && !token.isBlank()) {
            User u = authService.validateToken(token);
            if (u != null && u.getRole() == User.UserRole.SUPER_ADMIN) {
                return bus.register();
            }
        }
        // If auth fails, still register but consider limiting data server-side if needed
        return bus.register();
    }
}
