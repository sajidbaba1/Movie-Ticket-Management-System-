package com.moviebooking.service.rag;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.*;

@Service
public class RagService {

    private final PdfTextExtractor extractor;
    private final TextChunker chunker;
    private final EmbeddingService embeddingService;
    private final PineconeService pineconeService;
    private final GeminiChatService chatService;

    @Value("${pinecone.dimension:768}")
    private int expectedDim;

    public RagService(PdfTextExtractor extractor, TextChunker chunker,
                      EmbeddingService embeddingService, PineconeService pineconeService,
                      GeminiChatService chatService) {
        this.extractor = extractor;
        this.chunker = chunker;
        this.embeddingService = embeddingService;
        this.pineconeService = pineconeService;
        this.chatService = chatService;
    }

    public Map<String, Object> indexPdf(MultipartFile file) throws IOException {
        String text = extractor.extract(file);
        // Reasonable defaults for Gemini 004
        int chunkSize = 800;
        int overlap = 200;
        List<String> chunks = chunker.chunk(text, chunkSize, overlap);
        List<Map<String, Object>> vectors = new ArrayList<>();
        for (int i = 0; i < chunks.size(); i++) {
            String chunk = chunks.get(i);
            float[] vec = embeddingService.embed(chunk);
            if (vec.length == 0) continue;
            // Optional: validate dimension
            if (expectedDim > 0 && vec.length != expectedDim) {
                // Skip mismatched vectors to avoid Pinecone errors
                continue;
            }
            Map<String, Object> v = new LinkedHashMap<>();
            v.put("id", String.valueOf(hashId(file.getOriginalFilename() + ":" + i)));
            v.put("values", toDoubleList(vec));
            Map<String, Object> md = new LinkedHashMap<>();
            md.put("source", Optional.ofNullable(file.getOriginalFilename()).orElse("report.pdf"));
            md.put("index", i);
            md.put("text", truncate(chunk, 1200));
            v.put("metadata", md);
            vectors.add(v);
        }
        if (!vectors.isEmpty()) {
            pineconeService.upsert(vectors);
        }
        Map<String, Object> res = new LinkedHashMap<>();
        res.put("chunks", chunks.size());
        res.put("upserted", vectors.size());
        return res;
    }

    @SuppressWarnings("unchecked")
    public Map<String, Object> chat(String question) {
        float[] qVec = embeddingService.embed(question);
        List<Map<String, Object>> matches = pineconeService.query(qVec, 8, true);
        List<Map<String, Object>> sources = new ArrayList<>();
        StringBuilder ctx = new StringBuilder();
        int ctxLimit = 3000; // characters
        for (Map<String, Object> m : matches) {
            Map<String, Object> md = (Map<String, Object>) m.get("metadata");
            if (md == null) md = Map.of();
            String snippet = Objects.toString(md.getOrDefault("text", ""));
            Map<String, Object> s = new LinkedHashMap<>();
            s.put("id", m.getOrDefault("id", ""));
            s.put("title", md.getOrDefault("source", "PDF"));
            s.put("page", md.getOrDefault("index", null));
            s.put("snippet", snippet);
            sources.add(s);
            if (ctx.length() < ctxLimit) {
                int remaining = ctxLimit - ctx.length();
                String add = snippet.length() > remaining ? snippet.substring(0, remaining) : snippet;
                ctx.append(add).append("\n---\n");
            }
        }
        String answer = chatService.answer(question, ctx.toString());
        if (answer == null || answer.isBlank()) {
            answer = sources.isEmpty() ?
                    "No relevant context found in index for your question." :
                    "Answer based on top context:\n" + Objects.toString(sources.get(0).get("snippet"), "");
        }
        return Map.of("answer", answer, "sources", sources);
    }

    private String hashId(String input) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] h = digest.digest(input.getBytes(StandardCharsets.UTF_8));
            StringBuilder sb = new StringBuilder();
            for (int i = 0; i < 16 && i < h.length; i++) {
                sb.append(String.format("%02x", h[i]));
            }
            return sb.toString();
        } catch (NoSuchAlgorithmException e) {
            return UUID.randomUUID().toString();
        }
    }

    private List<Double> toDoubleList(float[] v) {
        List<Double> list = new ArrayList<>(v.length);
        for (float f : v) list.add((double) f);
        return list;
    }

    private String truncate(String s, int max) {
        if (s == null) return "";
        return s.length() <= max ? s : s.substring(0, max);
    }
}
