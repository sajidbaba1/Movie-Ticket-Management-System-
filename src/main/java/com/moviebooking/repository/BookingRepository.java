package com.moviebooking.repository;

import com.moviebooking.entity.Booking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.time.LocalDateTime;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {
    List<Booking> findByUserId(Long userId);
    List<Booking> findByScheduleId(Long scheduleId);

    // Date range queries
    List<Booking> findByCreatedAtBetween(LocalDateTime start, LocalDateTime end);

    // Scopes for theater owner
    List<Booking> findBySchedule_Theater_Id(Long theaterId);
    List<Booking> findBySchedule_Theater_IdAndCreatedAtBetween(Long theaterId, LocalDateTime start, LocalDateTime end);

    // Scopes for user
    List<Booking> findByUserIdAndCreatedAtBetween(Long userId, LocalDateTime start, LocalDateTime end);
}
