package com.aucxion.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "port_scan_results")
public class PortScanResult {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private int portNumber;
    private String serviceName;
    private String protocol;
    private String exposureLevel;
    private boolean isOpen;
    private String riskDescription;
    private LocalDateTime scannedAt;

    @PrePersist
    public void prePersist() {
        if (scannedAt == null) scannedAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public int getPortNumber() { return portNumber; }
    public void setPortNumber(int portNumber) { this.portNumber = portNumber; }

    public String getServiceName() { return serviceName; }
    public void setServiceName(String serviceName) { this.serviceName = serviceName; }

    public String getProtocol() { return protocol; }
    public void setProtocol(String protocol) { this.protocol = protocol; }

    public String getExposureLevel() { return exposureLevel; }
    public void setExposureLevel(String exposureLevel) { this.exposureLevel = exposureLevel; }

    public boolean isOpen() { return isOpen; }
    public void setOpen(boolean open) { isOpen = open; }

    public String getRiskDescription() { return riskDescription; }
    public void setRiskDescription(String riskDescription) { this.riskDescription = riskDescription; }

    public LocalDateTime getScannedAt() { return scannedAt; }
    public void setScannedAt(LocalDateTime scannedAt) { this.scannedAt = scannedAt; }
}
