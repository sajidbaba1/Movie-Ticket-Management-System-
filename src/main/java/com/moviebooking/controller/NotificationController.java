package com.moviebooking.controller;

import com.moviebooking.entity.Notification;
import com.moviebooking.entity.User;
import com.moviebooking.service.AuthService;
import com.moviebooking.service.NotificationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174", "http://localhost:5175"})
public class NotificationController {

    private final NotificationService notificationService;
    private final AuthService authService;

    public NotificationController(NotificationService notificationService, AuthService authService) {
        this.notificationService = notificationService;
        this.authService = authService;
    }

    @GetMapping("/my")
    public ResponseEntity<?> myNotifications(@RequestHeader(name = "Authorization", required = false) String authorization,
                                             @RequestParam(name = "unreadOnly", defaultValue = "false") boolean unreadOnly) {
        User user = getUserOrUnauthorized(authorization);
        if (user == null) return ResponseEntity.status(401).body(Map.of("message", "Unauthorized"));
        List<Notification> list = notificationService.getForUser(user.getId(), unreadOnly);
        return ResponseEntity.ok(list);
    }

    @GetMapping("/my/count")
    public ResponseEntity<?> unreadCount(@RequestHeader(name = "Authorization", required = false) String authorization) {
        User user = getUserOrUnauthorized(authorization);
        if (user == null) return ResponseEntity.status(401).body(Map.of("message", "Unauthorized"));
        long count = notificationService.countUnread(user.getId());
        return ResponseEntity.ok(Map.of("count", count));
    }

    @PatchMapping("/{id}/read")
    public ResponseEntity<?> markRead(@RequestHeader(name = "Authorization", required = false) String authorization,
                                      @PathVariable Long id) {
        User user = getUserOrUnauthorized(authorization);
        if (user == null) return ResponseEntity.status(401).body(Map.of("message", "Unauthorized"));
        notificationService.markRead(id, user.getId());
        return ResponseEntity.ok(Map.of("status", "ok"));
    }

    @PatchMapping("/read-all")
    public ResponseEntity<?> markAllRead(@RequestHeader(name = "Authorization", required = false) String authorization) {
        User user = getUserOrUnauthorized(authorization);
        if (user == null) return ResponseEntity.status(401).body(Map.of("message", "Unauthorized"));
        notificationService.markAllRead(user.getId());
        return ResponseEntity.ok(Map.of("status", "ok"));
    }

    private User getUserOrUnauthorized(String authorization) {
        if (authorization == null || !authorization.startsWith("Bearer ")) return null;
        String token = authorization.substring("Bearer ".length());
        return authService.validateToken(token);
    }
}
