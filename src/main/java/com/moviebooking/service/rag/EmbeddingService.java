package com.moviebooking.service.rag;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class EmbeddingService {

    private final WebClient webClient;

    @Value("${gemini.api.key}")
    private String apiKey;

    @Value("${gemini.embedding.model:text-embedding-004}")
    private String model;

    public EmbeddingService(WebClient.Builder builder) {
        this.webClient = builder.baseUrl("https://generativelanguage.googleapis.com").build();
    }

    @SuppressWarnings("unchecked")
    public float[] embed(String text) {
        Map<String, Object> body = new HashMap<>();
        Map<String, Object> content = Map.of(
                "parts", List.of(Map.of("text", text))
        );
        body.put("content", content);

        Map<String, Object> response = webClient.post()
                .uri(uriBuilder -> uriBuilder
                        .path("/v1beta/models/{model}:embedContent")
                        .queryParam("key", apiKey)
                        .build(model))
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(body)
                .retrieve()
                .bodyToMono(Map.class)
                .onErrorResume(e -> Mono.just(Map.of("embedding", Map.of("values", List.of()))))
                .block();

        if (response == null) return new float[0];
        Map<String, Object> embedding = (Map<String, Object>) response.get("embedding");
        if (embedding == null) return new float[0];
        List<Double> values = (List<Double>) embedding.get("values");
        if (values == null) return new float[0];
        float[] out = new float[values.size()];
        for (int i = 0; i < values.size(); i++) out[i] = values.get(i).floatValue();
        return out;
    }
}
