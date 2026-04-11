package com.aucxion.repository;

import com.aucxion.model.ThreatLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Map;

@Repository
public interface ThreatLogRepository extends JpaRepository<ThreatLog, Long> {

    List<ThreatLog> findAllByOrderByDetectedAtDesc();

    List<ThreatLog> findByAttackType(String attackType);

    List<ThreatLog> findBySeverity(String severity);

    @Query("SELECT t.attackType, COUNT(t) FROM ThreatLog t GROUP BY t.attackType")
    List<Object[]> countByAttackType();

    @Query("SELECT t.severity, COUNT(t) FROM ThreatLog t GROUP BY t.severity")
    List<Object[]> countBySeverity();
}
