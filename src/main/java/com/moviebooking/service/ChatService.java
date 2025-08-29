package com.moviebooking.service;

import com.moviebooking.entity.User;
import com.moviebooking.entity.User.UserRole;
import com.moviebooking.repository.UserRepository;
import com.moviebooking.repository.MovieRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.util.Map;

@Service
public class ChatService {
    private final WebClient webClient;
    private final UserRepository userRepository;
    private final MovieRepository movieRepository;

    @Value("${gemini.api.key:}")
    private String geminiApiKey;

    public ChatService(UserRepository userRepository, MovieRepository movieRepository) {
        this.userRepository = userRepository;
        this.movieRepository = movieRepository;
        this.webClient = WebClient.builder().baseUrl("https://generativelanguage.googleapis.com").build();
    }

    public Mono<String> ask(User user, String message) {
        // Local quick answers for common queries (bypass external LLM)
        String lower = message.toLowerCase();
        if (lower.contains("how many movies") || lower.matches(".*\\bmovie(s)? count\\b.*")) {
            long count = movieRepository.countByActiveTrue();
            return Mono.just("We currently have " + count + " active movies 🎬");
        }

        String systemPrompt = buildSystemPrompt(user);
        String content = systemPrompt + "\n\nUser: " + message + "\nAnswer with friendly emojis where appropriate.";

        if (geminiApiKey == null || geminiApiKey.isBlank()) {
            // fallback if key not configured
            return Mono.just("🤖 Gemini is not configured. Please set GEMINI_API_KEY on the server.");
        }

        Map<String, Object> payload = Map.of(
                "contents", new Object[]{
                        Map.of("parts", new Object[]{Map.of("text", content)})
                }
        );

        return webClient.post()
                .uri(uriBuilder -> uriBuilder
                        .path("/v1beta/models/gemini-1.5-flash:generateContent")
                        .queryParam("key", geminiApiKey)
                        .build())
                .contentType(MediaType.APPLICATION_JSON)
                .accept(MediaType.APPLICATION_JSON)
                .bodyValue(payload)
                .retrieve()
                .bodyToMono(Map.class)
                .map(resp -> {
                    try {
                        // Extract first candidate text
                        var candidates = (java.util.List<?>) resp.get("candidates");
                        if (candidates == null || candidates.isEmpty()) return "No response";
                        var cand0 = (Map<?, ?>) candidates.get(0);
                        var contentMap = (Map<?, ?>) cand0.get("content");
                        var parts = (java.util.List<?>) contentMap.get("parts");
                        if (parts == null || parts.isEmpty()) return "No response";
                        var part0 = (Map<?, ?>) parts.get(0);
                        Object text = part0.get("text");
                        return text != null ? text.toString() : "No response";
                    } catch (Exception e) {
                        return "Failed to parse AI response";
                    }
                })
                .onErrorReturn("⚠️ AI service error. Please try again later.");
    }

    private String buildSystemPrompt(User user) {
        UserRole role = user.getRole();
        long totalAdmins = userRepository.countByRole(UserRole.ADMIN);
        long totalCustomers = userRepository.countByRole(UserRole.CUSTOMER);
        long totalTheaterOwners = userRepository.countByRole(UserRole.THEATER_OWNER);

        String base = "You are MovieHub AI Assistant. Answer concisely and helpfully with emojis. " +
                "Current user: " + role + ", email=" + user.getEmail() + ". ";

        return switch (role) {
            case SUPER_ADMIN -> base + "You can summarize system status (admins/customers/theater_owners). " +
                    "Stats: admins=" + totalAdmins + ", customers=" + totalCustomers + ", theaterOwners=" + totalTheaterOwners + ".";
            case THEATER_OWNER -> base + "Focus on theater operations and schedules for this owner. " +
                    "Limit data to the user's scope.";
            case ADMIN -> base + "Assist with content and theater management tasks within admin scope.";
            case CUSTOMER -> base + "Help with movies, shows, bookings, and payments for the customer.";
        };
    }
}
