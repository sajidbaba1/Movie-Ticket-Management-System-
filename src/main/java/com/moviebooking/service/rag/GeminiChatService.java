package com.moviebooking.service.rag;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class GeminiChatService {

    private final WebClient webClient;

    @Value("${gemini.api.key}")
    private String apiKey;

    @Value("${gemini.chat.model:gemini-1.5-flash}")
    private String chatModel;

    public GeminiChatService(WebClient.Builder builder) {
        this.webClient = builder.baseUrl("https://generativelanguage.googleapis.com").build();
    }

    @SuppressWarnings("unchecked")
    public String answer(String question, String context) {
        // Gemini v1beta expects optional system_instruction and a list of contents with roles
        String prompt = "You are a helpful analyst. Answer strictly based on the provided context from business PDF reports. " +
                "If the answer isn't in context, say you are not sure.\n\n" +
                "Context:\n" + context + "\n\nQuestion: " + question + "\nAnswer:";

        Map<String, Object> body = new HashMap<>();
        body.put("system_instruction", Map.of(
                "role", "system",
                "parts", List.of(Map.of("text", "Answer only using the provided context. If insufficient, reply: 'I'm not sure based on the available context.'"))
        ));
        body.put("contents", List.of(
                Map.of(
                        "role", "user",
                        "parts", List.of(Map.of("text", prompt))
                )
        ));

        Map<String, Object> resp = webClient.post()
                .uri(uriBuilder -> uriBuilder
                        .path("/v1beta/models/{model}:generateContent")
                        .queryParam("key", apiKey)
                        .build(chatModel))
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(body)
                .retrieve()
                .bodyToMono(Map.class)
                .block();

        if (resp == null) return "";
        List<Map<String, Object>> candidates = (List<Map<String, Object>>) resp.get("candidates");
        if (candidates == null || candidates.isEmpty()) return "";
        Map<String, Object> content = (Map<String, Object>) candidates.get(0).get("content");
        if (content == null) return "";
        List<Map<String, Object>> parts = (List<Map<String, Object>>) content.get("parts");
        if (parts == null || parts.isEmpty()) return "";
        Object text = parts.get(0).get("text");
        return text == null ? "" : text.toString();
    }
}
