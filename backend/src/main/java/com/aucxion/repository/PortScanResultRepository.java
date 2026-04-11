package com.aucxion.repository;

import com.aucxion.model.PortScanResult;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PortScanResultRepository extends JpaRepository<PortScanResult, Long> {
    List<PortScanResult> findByIsOpenTrue();
    List<PortScanResult> findByExposureLevel(String exposureLevel);
    void deleteAllByScannedAtBefore(java.time.LocalDateTime dateTime);
}
