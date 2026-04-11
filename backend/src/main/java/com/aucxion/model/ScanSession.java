package com.aucxion.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "scan_sessions")
public class ScanSession {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private LocalDateTime startedAt;
    private LocalDateTime completedAt;
    private String status;
    private int threatsFound;
    private int portsScanned;
    private String systemRiskLevel;

    @PrePersist
    public void prePersist() {
        if (startedAt == null) startedAt = LocalDateTime.now();
        if (status == null) status = "RUNNING";
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public LocalDateTime getStartedAt() { return startedAt; }
    public void setStartedAt(LocalDateTime startedAt) { this.startedAt = startedAt; }

    public LocalDateTime getCompletedAt() { return completedAt; }
    public void setCompletedAt(LocalDateTime completedAt) { this.completedAt = completedAt; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public int getThreatsFound() { return threatsFound; }
    public void setThreatsFound(int threatsFound) { this.threatsFound = threatsFound; }

    public int getPortsScanned() { return portsScanned; }
    public void setPortsScanned(int portsScanned) { this.portsScanned = portsScanned; }

    public String getSystemRiskLevel() { return systemRiskLevel; }
    public void setSystemRiskLevel(String systemRiskLevel) { this.systemRiskLevel = systemRiskLevel; }
}
