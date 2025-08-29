package com.moviebooking.controller;

import com.moviebooking.entity.User;
import com.moviebooking.service.AuthService;
import com.moviebooking.service.ChatService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Mono;

import java.util.Map;

@RestController
@RequestMapping("/api/chat")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174", "http://localhost:5175"})
public class ChatController {

    private final ChatService chatService;
    private final AuthService authService;

    public ChatController(ChatService chatService, AuthService authService) {
        this.chatService = chatService;
        this.authService = authService;
    }

    @PostMapping("/ask")
    public Mono<ResponseEntity<Map<String, Object>>> ask(@RequestHeader(name = "Authorization", required = false) String authorization,
                                                         @RequestBody Map<String, String> body) {
        if (authorization == null || !authorization.startsWith("Bearer ")) {
            return Mono.just(ResponseEntity.status(401).body(Map.of("message", "Missing or invalid token")));
        }
        String token = authorization.substring("Bearer ".length());
        User user = authService.validateToken(token);
        if (user == null) {
            return Mono.just(ResponseEntity.status(401).body(Map.of("message", "Unauthorized")));
        }
        String message = body.getOrDefault("message", "");
        if (message.isBlank()) {
            return Mono.just(ResponseEntity.badRequest().body(Map.of("message", "Message is required")));
        }
        return chatService.ask(user, message)
                .map(answer -> ResponseEntity.ok(Map.of(
                        "answer", answer,
                        "role", user.getRole().name()
                )));
    }
}
