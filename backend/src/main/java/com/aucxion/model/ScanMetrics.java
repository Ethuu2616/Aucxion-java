package com.aucxion.model;

public class ScanMetrics {
    private int filesScanned;
    private int processesAnalyzed;
    private int networkConnectionsChecked;
    private int logEntriesReviewed;
    private int systemFilesChecked;
    private double accuracyScore;
    private String scanDepth;
    
    public ScanMetrics() {
        this.filesScanned = 0;
        this.processesAnalyzed = 0;
        this.networkConnectionsChecked = 0;
        this.logEntriesReviewed = 0;
        this.systemFilesChecked = 0;
        this.accuracyScore = 0.0;
        this.scanDepth = "STANDARD";
    }

    // Getters and Setters
    public int getFilesScanned() {
        return filesScanned;
    }

    public void setFilesScanned(int filesScanned) {
        this.filesScanned = filesScanned;
    }

    public int getProcessesAnalyzed() {
        return processesAnalyzed;
    }

    public void setProcessesAnalyzed(int processesAnalyzed) {
        this.processesAnalyzed = processesAnalyzed;
    }

    public int getNetworkConnectionsChecked() {
        return networkConnectionsChecked;
    }

    public void setNetworkConnectionsChecked(int networkConnectionsChecked) {
        this.networkConnectionsChecked = networkConnectionsChecked;
    }

    public int getLogEntriesReviewed() {
        return logEntriesReviewed;
    }

    public void setLogEntriesReviewed(int logEntriesReviewed) {
        this.logEntriesReviewed = logEntriesReviewed;
    }

    public int getSystemFilesChecked() {
        return systemFilesChecked;
    }

    public void setSystemFilesChecked(int systemFilesChecked) {
        this.systemFilesChecked = systemFilesChecked;
    }

    public double getAccuracyScore() {
        return accuracyScore;
    }

    public void setAccuracyScore(double accuracyScore) {
        this.accuracyScore = accuracyScore;
    }

    public String getScanDepth() {
        return scanDepth;
    }

    public void setScanDepth(String scanDepth) {
        this.scanDepth = scanDepth;
    }
    
    public void calculateAccuracy() {
        // Calculate accuracy based on scan depth and coverage
        int totalChecks = filesScanned + processesAnalyzed + networkConnectionsChecked + 
                         logEntriesReviewed + systemFilesChecked;
        
        if (totalChecks == 0) {
            this.accuracyScore = 0.0;
            return;
        }
        
        // Base accuracy on comprehensive scanning
        double baseScore = 60.0;
        
        // Add points for each category scanned
        if (filesScanned > 0) baseScore += 8.0;
        if (processesAnalyzed > 0) baseScore += 8.0;
        if (networkConnectionsChecked > 0) baseScore += 8.0;
        if (logEntriesReviewed > 0) baseScore += 8.0;
        if (systemFilesChecked > 0) baseScore += 8.0;
        
        // Bonus for depth
        if (totalChecks > 100) baseScore += 5.0;
        if (totalChecks > 500) baseScore += 5.0;
        
        this.accuracyScore = Math.min(100.0, baseScore);
    }
}
