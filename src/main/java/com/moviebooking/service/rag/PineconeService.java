package com.moviebooking.service.rag;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;
import reactor.core.publisher.Mono;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class PineconeService {

    private final WebClient webClient;

    @Value("${pinecone.api.key}")
    private String apiKey;

    @Value("${pinecone.host}")
    private String host;

    @Value("${pinecone.namespace:reports}")
    private String namespace;

    public PineconeService(WebClient.Builder builder) {
        this.webClient = builder.build();
    }

    public void upsert(List<Map<String, Object>> vectors) {
        int batchSize = 50;
        for (int i = 0; i < vectors.size(); i += batchSize) {
            int end = Math.min(vectors.size(), i + batchSize);
            List<Map<String, Object>> batch = vectors.subList(i, end);
            Map<String, Object> body = new HashMap<>();
            body.put("vectors", batch);
            body.put("namespace", namespace);

            try {
                webClient.post()
                        .uri(host + "/vectors/upsert")
                        .header("Api-Key", apiKey)
                        .accept(MediaType.APPLICATION_JSON)
                        .contentType(MediaType.APPLICATION_JSON)
                        .bodyValue(body)
                        .retrieve()
                        .onStatus(s -> s.is4xxClientError() || s.is5xxServerError(),
                                resp -> resp.bodyToMono(String.class)
                                        .flatMap(msg -> Mono.error(new RuntimeException("Pinecone upsert error (" + resp.statusCode() + "): " + msg))))
                        .toBodilessEntity()
                        .block();
            } catch (WebClientResponseException e) {
                String msg = e.getResponseBodyAsString();
                throw new RuntimeException("Pinecone upsert failed: " + e.getStatusCode() + " - " + msg, e);
            }
        }
    }

    @SuppressWarnings("unchecked")
    public List<Map<String, Object>> query(float[] vector, int topK, boolean includeMetadata) {
        Map<String, Object> body = new HashMap<>();
        body.put("topK", topK);
        body.put("vector", vector);
        body.put("includeMetadata", includeMetadata);
        body.put("namespace", namespace);

        Map<String, Object> resp = webClient.post()
                .uri(host + "/query")
                .header("Api-Key", apiKey)
                .accept(MediaType.APPLICATION_JSON)
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(body)
                .retrieve()
                .onStatus(s -> s.is4xxClientError() || s.is5xxServerError(),
                        r -> r.bodyToMono(String.class)
                                .flatMap(msg -> Mono.error(new RuntimeException("Pinecone query error (" + r.statusCode() + "): " + msg))))
                .bodyToMono(Map.class)
                .block();
        if (resp == null) return List.of();
        return (List<Map<String, Object>>) resp.getOrDefault("matches", List.of());
    }
}
