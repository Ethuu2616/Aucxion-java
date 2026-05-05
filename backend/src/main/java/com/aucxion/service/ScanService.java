package com.aucxion.service;

import com.aucxion.model.ScanSession;
import com.aucxion.model.ThreatLog;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;

@Service
public class ScanService {

    private final ThreatDetectionService threatDetectionService;
    private final PortScannerService portScannerService;
    private volatile boolean scanRunning = false;
    private ScanSession currentSession;

    public ScanService(ThreatDetectionService threatDetectionService,
                       PortScannerService portScannerService) {
        this.threatDetectionService = threatDetectionService;
        this.portScannerService = portScannerService;
    }

    public ScanSession startScan() {
        if (scanRunning) {
            return currentSession;
        }
        scanRunning = true;
        
        // Clear previous threats
        threatDetectionService.clearAllThreats();
        
        // Reset metrics for new scan
        threatDetectionService.resetMetrics();

        currentSession = new ScanSession();
        currentSession.setId(System.currentTimeMillis());
        currentSession.setStatus("RUNNING");
        currentSession.setStartedAt(LocalDateTime.now());

        // Run scan in background thread
        new Thread(() -> runFullScan()).start();

        return currentSession;
    }

    private void runFullScan() {
        try {
            List<ThreatLog> allThreats = new ArrayList<>();
            allThreats.addAll(threatDetectionService.detectDDoS());
            allThreats.addAll(threatDetectionService.detectRansomware());
            allThreats.addAll(threatDetectionService.detectZeroDay());
            allThreats.addAll(threatDetectionService.detectPhishing());

            portScannerService.scanPorts();

            String riskLevel = calculateRiskLevel(allThreats);

            currentSession.setStatus("COMPLETED");
            currentSession.setCompletedAt(LocalDateTime.now());
            currentSession.setThreatsFound(allThreats.size());
            currentSession.setPortsScanned(portScannerService.getAllResults().size());
            currentSession.setSystemRiskLevel(riskLevel);
        } catch (Exception e) {
            currentSession.setStatus("COMPLETED");
            currentSession.setCompletedAt(LocalDateTime.now());
            currentSession.setSystemRiskLevel("UNKNOWN");
        } finally {
            scanRunning = false;
        }
    }

    public ScanSession stopScan() {
        scanRunning = false;
        if (currentSession != null && "RUNNING".equals(currentSession.getStatus())) {
            currentSession.setStatus("STOPPED");
            currentSession.setCompletedAt(LocalDateTime.now());
        }
        return currentSession;
    }

    public Map<String, Object> getScanResults() {
        Map<String, Object> results = new HashMap<>();

        results.put("session", currentSession);
        results.put("threats", threatDetectionService.getAllThreats());
        results.put("ports", portScannerService.getAllResults());
        results.put("scanRunning", scanRunning);
        results.put("metrics", threatDetectionService.getCurrentMetrics());

        // Attack type breakdown
        Map<String, Long> attackBreakdown = new LinkedHashMap<>();
        List<ThreatLog> threats = threatDetectionService.getAllThreats();
        for (ThreatLog threat : threats) {
            attackBreakdown.merge(threat.getAttackType(), 1L, Long::sum);
        }
        results.put("attackBreakdown", attackBreakdown);

        // Severity breakdown
        Map<String, Long> severityBreakdown = new LinkedHashMap<>();
        for (ThreatLog threat : threats) {
            severityBreakdown.merge(threat.getSeverity(), 1L, Long::sum);
        }
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
