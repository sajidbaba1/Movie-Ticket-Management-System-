package com.moviebooking.repository;

import com.moviebooking.entity.Schedule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ScheduleRepository extends JpaRepository<Schedule, Long> {
  List<Schedule> findByActiveTrue();

  List<Schedule> findByTheaterId(Long theaterId);

  List<Schedule> findByTheaterIdAndActiveTrue(Long theaterId);

  List<Schedule> findByMovieId(Long movieId);

  List<Schedule> findByMovieIdAndActiveTrue(Long movieId);

  List<Schedule> findByTheaterIdAndMovieIdAndActiveTrue(Long theaterId, Long movieId);

  List<Schedule> findByShowTimeBetweenAndActiveTrue(LocalDateTime startTime, LocalDateTime endTime);

  List<Schedule> findByTheaterIdAndShowTimeBetweenAndActiveTrue(Long theaterId, LocalDateTime startTime,
      LocalDateTime endTime);
}