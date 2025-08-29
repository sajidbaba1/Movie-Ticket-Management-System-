package com.moviebooking.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.math.BigDecimal;

@Entity
@Table(name = "schedules")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Schedule {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "movie_id", nullable = false)
  private Movie movie;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "theater_id", nullable = false)
  private Theater theater;

  @Column(nullable = false)
  private LocalDateTime showTime;

  @Column(nullable = false)
  private BigDecimal price;

  @Column(nullable = false)
  private Integer availableSeats;

  @Column(nullable = false)
  private Integer totalSeats;

  @Column(nullable = false)
  private boolean active = true;

  @Column(nullable = false)
  private LocalDateTime createdAt = LocalDateTime.now();

  @Column
  private String screenNumber;

  @Column
  private String additionalInfo;

  // Governance: status lifecycle for show schedules
  public enum Status { DRAFT, APPROVED, ON_SALE, CANCELLED, COMPLETED }

  @Enumerated(EnumType.STRING)
  @Column(nullable = false)
  private Status status = Status.DRAFT;

  // Approval metadata
  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "approved_by_id")
  private User approvedBy;

  @Column
  private LocalDateTime approvedAt;

  @Column(length = 1000)
  private String approvalNotes;
}