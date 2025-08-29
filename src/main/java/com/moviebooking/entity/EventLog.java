package com.moviebooking.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "event_logs")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class EventLog {
    public enum EntityType { THEATER, SCREEN, MOVIE, SHOW, COUPON, BOOKING }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EntityType entityType;

    @Column(nullable = false)
    private Long entityId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @Column(nullable = false)
    private String eventType; // e.g., SUBMIT, APPROVE, REJECT, ACTIVATE, DEACTIVATE, ON_SALE, CANCEL

    @Column
    private String fromStatus;

    @Column
    private String toStatus;

    @Column(length = 1000)
    private String notes;

    @Column(nullable = false)
    private LocalDateTime at = LocalDateTime.now();
}
