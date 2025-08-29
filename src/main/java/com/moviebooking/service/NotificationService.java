package com.moviebooking.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.moviebooking.entity.Notification;
import com.moviebooking.entity.User;
import com.moviebooking.repository.NotificationRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.Map;

@Service
public class NotificationService {
    private final NotificationRepository notificationRepository;
    private final ObjectMapper objectMapper;

    public NotificationService(NotificationRepository notificationRepository) {
        this.notificationRepository = notificationRepository;
        this.objectMapper = new ObjectMapper();
    }

    @Transactional
    public Notification create(User user, String title, String message, Notification.Type type, Map<String, Object> data) {
        Notification n = new Notification();
        n.setUser(user);
        n.setTitle(title);
        n.setMessage(message);
        n.setType(type);
        n.setCreatedAt(Instant.now());
        n.setReadFlag(false);
        if (data != null) {
            try {
                n.setDataJson(objectMapper.writeValueAsString(data));
            } catch (JsonProcessingException ignored) {
                n.setDataJson(null);
            }
        }
        return notificationRepository.save(n);
    }

    @Transactional(readOnly = true)
    public List<Notification> getForUser(Long userId, boolean unreadOnly) {
        if (unreadOnly) return notificationRepository.findByUserIdAndReadFlagFalseOrderByCreatedAtDesc(userId);
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    @Transactional
    public void markRead(Long id, Long userId) {
        notificationRepository.findById(id).ifPresent(n -> {
            if (n.getUser().getId().equals(userId)) {
                n.setReadFlag(true);
                notificationRepository.save(n);
            }
        });
    }

    @Transactional
    public void markAllRead(Long userId) {
        List<Notification> list = notificationRepository.findByUserIdAndReadFlagFalseOrderByCreatedAtDesc(userId);
        for (Notification n : list) {
            n.setReadFlag(true);
        }
        notificationRepository.saveAll(list);
    }

    @Transactional(readOnly = true)
    public long countUnread(Long userId) {
        return notificationRepository.countByUserIdAndReadFlagFalse(userId);
    }
}
