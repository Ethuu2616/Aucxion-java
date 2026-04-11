package com.aucxion.service;

import com.aucxion.model.ScanSession;
import com.aucxion.model.ThreatLog;
import com.aucxion.model.PortScanResult;
import com.aucxion.repository.ScanSessionRepository;
import com.aucxion.repository.ThreatLogRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;

@Service
public class ScanService {

    private final ScanSessionRepository scanSessionRepository;
    private final ThreatLogRepository threatLogRepository;
    private final ThreatDetectionService threatDetectionService;
    private final PortScannerService portScannerService;

    public ScanService(ScanSessionRepository scanSessionRepository,
                       ThreatLogRepository threatLogRepository,
                       ThreatDetectionService threatDetectionService,
                       PortScannerService portScannerService) {
        this.scanSessionRepository = scanSessionRepository;
        this.threatLogRepository = threatLogRepository;
        this.threatDetectionService = threatDetectionService;
        this.portScannerService = portScannerService;
    }

    private volatile boolean scanRunning = false;

    public ScanSession startScan() {
        if (scanRunning) {
            return scanSessionRepository.findTopByStatusOrderByStartedAtDesc("RUNNING").orElse(null);
        }
        scanRunning = true;

        ScanSession session = new ScanSession();
        session.setStatus("RUNNING");
        session.setStartedAt(LocalDateTime.now());
        ScanSession saved = scanSessionRepository.save(session);

        // Run scan in background thread
        new Thread(() -> runFullScan(saved.getId())).start();

        return saved;
    }

    private void runFullScan(Long sessionId) {
        try {
            List<ThreatLog> allThreats = new ArrayList<>();
            allThreats.addAll(threatDetectionService.detectDDoS());
            allThreats.addAll(threatDetectionService.detectRansomware());
            allThreats.addAll(threatDetectionService.detectZeroDay());
            allThreats.addAll(threatDetectionService.detectPhishing());

            List<PortScanResult> ports = portScannerService.scanPorts();

            String riskLevel = calculateRiskLevel(allThreats);

            ScanSession session = scanSessionRepository.findById(sessionId).orElseThrow();
            session.setStatus("COMPLETED");
            session.setCompletedAt(LocalDateTime.now());
            session.setThreatsFound(allThreats.size());
            session.setPortsScanned(ports.size());
            session.setSystemRiskLevel(riskLevel);
            scanSessionRepository.save(session);
        } catch (Exception e) {
            scanSessionRepository.findById(sessionId).ifPresent(s -> {
                s.setStatus("COMPLETED");
                s.setCompletedAt(LocalDateTime.now());
                s.setSystemRiskLevel("UNKNOWN");
                scanSessionRepository.save(s);
            });
        } finally {
            scanRunning = false;
        }
    }

    public ScanSession stopScan() {
        scanRunning = false;
        return scanSessionRepository.findTopByStatusOrderByStartedAtDesc("RUNNING").map(session -> {
            session.setStatus("STOPPED");
            session.setCompletedAt(LocalDateTime.now());
            return scanSessionRepository.save(session);
        }).orElse(null);
    }

    public Map<String, Object> getScanResults() {
        Map<String, Object> results = new HashMap<>();

        ScanSession latest = scanSessionRepository.findTopByOrderByStartedAtDesc().orElse(null);
        results.put("session", latest);
        results.put("threats", threatLogRepository.findAllByOrderByDetectedAtDesc());
        results.put("ports", portScannerService.getAllResults());
        results.put("scanRunning", scanRunning);

        // Attack type breakdown
        Map<String, Long> attackBreakdown = new LinkedHashMap<>();
        threatLogRepository.countByAttackType().forEach(row ->
                attackBreakdown.put((String) row[0], (Long) row[1]));
        results.put("attackBreakdown", attackBreakdown);

        // Severity breakdown
        Map<String, Long> severityBreakdown = new LinkedHashMap<>();
        threatLogRepository.countBySeverity().forEach(row ->
                severityBreakdown.put((String) row[0], (Long) row[1]));
        results.put("severityBreakdown", severityBreakdown);

        return results;
    }

    private String calculateRiskLevel(List<ThreatLog> threats) {
        long critical = threats.stream().filter(t -> "CRITICAL".equals(t.getSeverity())).count();
        long high = threats.stream().filter(t -> "HIGH".equals(t.getSeverity())).count();
        if (critical > 0) return "CRITICAL";
        if (high > 2) return "HIGH";
        if (high > 0 || !threats.isEmpty()) return "MEDIUM";
        return "SAFE";
    }

    public boolean isScanRunning() {
        return scanRunning;
    }
}
