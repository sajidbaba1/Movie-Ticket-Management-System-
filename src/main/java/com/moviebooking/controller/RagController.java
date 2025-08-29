package com.moviebooking.controller;

import com.moviebooking.service.rag.RagService;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/rag")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174", "http://localhost:5175"})
public class RagController {

    private final RagService ragService;

    public RagController(RagService ragService) {
        this.ragService = ragService;
    }

    @PostMapping(value = "/index-report", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<Map<String, Object>> indexReport(@RequestPart("file") MultipartFile file) throws IOException {
        Map<String, Object> res = ragService.indexPdf(file);
        return ResponseEntity.ok(res);
    }

    public static class ChatRequest { public String question; }
    public static class ChatSource { public String id; public String title; public Integer page; public String snippet; }
    public static class ChatResponse { public String answer; public List<ChatSource> sources; }

    @PostMapping("/chat")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<Map<String, Object>> chat(@RequestBody ChatRequest request) {
        Map<String, Object> res = ragService.chat(request != null ? request.question : "");
        return ResponseEntity.ok(res);
    }
}
