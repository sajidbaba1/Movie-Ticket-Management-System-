package com.moviebooking.repository;

import com.moviebooking.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByUserIdOrderByCreatedAtDesc(Long userId);
    List<Notification> findByUserIdAndReadFlagFalseOrderByCreatedAtDesc(Long userId);
    long countByUserIdAndReadFlagFalse(Long userId);
}
