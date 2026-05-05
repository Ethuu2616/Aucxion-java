package com.aucxion.model;

import java.time.LocalDateTime;

public class ScanSession {
    private Long id;
    private String status;
    private LocalDateTime startedAt;
    private LocalDateTime completedAt;
    private int threatsFound;
    private int portsScanned;
    private String systemRiskLevel;

    public ScanSession() {
        this.startedAt = LocalDateTime.now();
        this.status = "RUNNING";
        this.systemRiskLevel = "SAFE";
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public LocalDateTime getStartedAt() {
        return startedAt;
    }

    public void setStartedAt(LocalDateTime startedAt) {
        this.startedAt = startedAt;
    }

    public LocalDateTime getCompletedAt() {
        return completedAt;
    }

    public void setCompletedAt(LocalDateTime completedAt) {
        this.completedAt = completedAt;
    }

    public int getThreatsFound() {
        return threatsFound;
    }

    public void setThreatsFound(int threatsFound) {
        this.threatsFound = threatsFound;
    }

    public int getPortsScanned() {
        return portsScanned;
    }

    public void setPortsScanned(int portsScanned) {
        this.portsScanned = portsScanned;
    }

    public String getSystemRiskLevel() {
        return systemRiskLevel;
    }

    public void setSystemRiskLevel(String systemRiskLevel) {
        this.systemRiskLevel = systemRiskLevel;
    }
}
