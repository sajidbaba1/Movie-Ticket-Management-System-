package com.moviebooking.service.voice;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.moviebooking.service.rag.RagService;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.io.IOException;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class VoiceWebSocketHandler extends TextWebSocketHandler {

    private final ObjectMapper mapper = new ObjectMapper();
    private final RagService ragService;
    private final VoiceRagOrchestrator orchestrator;
    private final Map<String, SessionState> sessions = new ConcurrentHashMap<>();

    public VoiceWebSocketHandler(RagService ragService, VoiceRagOrchestrator orchestrator) {
        this.ragService = ragService;
        this.orchestrator = orchestrator;
    }

    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        sessions.put(session.getId(), new SessionState());
        sendJson(session, Map.of(
                "type", "ready",
                "sessionId", session.getId()
        ));
    }

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
        JsonNode node = mapper.readTree(message.getPayload());
        String type = node.path("type").asText("");
        switch (type) {
            case "user_text" -> onUserText(session, node.path("text").asText(""));
            case "interrupt" -> orchestrator.interrupt(session.getId());
            default -> sendJson(session, Map.of("type", "error", "message", "Unsupported message type: " + type));
        }
    }

    private void onUserText(WebSocketSession session, String text) throws IOException {
        if (text == null || text.isBlank()) return;
        // Retrieve context + generate answer using existing RAG stack
        String answer = orchestrator.answerWithRag(session.getId(), text);
        // Streamed delta could be added later; for now send full text
        sendJson(session, Map.of(
                "type", "bot_text",
                "text", answer
        ));
    }

    private void sendJson(WebSocketSession session, Map<String, Object> payload) throws IOException {
        try {
            session.sendMessage(new TextMessage(mapper.writeValueAsString(payload)));
        } catch (JsonProcessingException e) {
            session.sendMessage(new TextMessage("{\"type\":\"error\",\"message\":\"serialization_failed\"}"));
        }
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) throws Exception {
        sessions.remove(session.getId());
    }

    private static class SessionState {
        // Placeholder for per-session memory/state
    }
}
