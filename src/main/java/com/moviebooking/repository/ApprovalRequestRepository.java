package com.moviebooking.repository;

import com.moviebooking.entity.ApprovalRequest;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ApprovalRequestRepository extends JpaRepository<ApprovalRequest, Long> {
    List<ApprovalRequest> findByEntityTypeAndStatus(ApprovalRequest.EntityType entityType, ApprovalRequest.Status status);
}
