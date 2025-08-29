package com.moviebooking.service;

import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.List;
import java.util.concurrent.CopyOnWriteArrayList;

@Service
public class AnalyticsEventBus {
    private final List<SseEmitter> clients = new CopyOnWriteArrayList<>();

    public SseEmitter register() {
        SseEmitter emitter = new SseEmitter(0L); // no timeout
        clients.add(emitter);
        emitter.onCompletion(() -> clients.remove(emitter));
        emitter.onTimeout(() -> clients.remove(emitter));
        try {
            emitter.send(SseEmitter.event().name("INIT").data("connected"));
        } catch (IOException ignored) { }
        return emitter;
    }

    public void broadcast(String eventName, Object data) {
        for (SseEmitter emitter : clients) {
            try {
                emitter.send(SseEmitter.event().name(eventName).data(data));
            } catch (IOException e) {
                clients.remove(emitter);
            }
        }
    }
}
