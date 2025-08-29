package com.moviebooking.service.voice;

import com.moviebooking.service.rag.RagService;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class VoiceRagOrchestrator {

    private final RagService ragService;

    // Simple in-memory short-term memory per session
    private final Map<String, List<String>> sessionHistory = new ConcurrentHashMap<>();

    public VoiceRagOrchestrator(RagService ragService) {
        this.ragService = ragService;
    }

    public String answerWithRag(String sessionId, String userText) {
        // Maintain last few user turns (basic memory for now)
        sessionHistory.computeIfAbsent(sessionId, k -> new ArrayList<>());
        List<String> history = sessionHistory.get(sessionId);
        history.add(userText);
        if (history.size() > 10) {
            history.remove(0);
        }
        // Leverage existing RAG pipeline to answer
        Map<String, Object> result = ragService.chat(userText);
        Object ans = result.get("answer");
        return ans == null ? "" : ans.toString();
    }

    public void interrupt(String sessionId) {
        // Placeholder: when TTS is added, stop current synthesis for this session
    }
}
