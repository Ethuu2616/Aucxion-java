package com.aucxion.repository;

import com.aucxion.model.ScanSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ScanSessionRepository extends JpaRepository<ScanSession, Long> {
    Optional<ScanSession> findTopByStatusOrderByStartedAtDesc(String status);
    Optional<ScanSession> findTopByOrderByStartedAtDesc();
}
