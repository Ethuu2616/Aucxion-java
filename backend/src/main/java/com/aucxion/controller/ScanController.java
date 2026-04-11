package com.aucxion.controller;

import com.aucxion.model.ScanSession;
import com.aucxion.service.ScanService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/scan")
@CrossOrigin(origins = "http://localhost:3000")
public class ScanController {

    private final ScanService scanService;

    public ScanController(ScanService scanService) {
        this.scanService = scanService;
    }

    @PostMapping("/start")
    public ResponseEntity<?> startScan() {
        if (scanService.isScanRunning()) {
            return ResponseEntity.ok(Map.of("message", "Scan already running", "status", "RUNNING"));
        }
        ScanSession session = scanService.startScan();
        return ResponseEntity.ok(session);
    }

    @PostMapping("/stop")
    public ResponseEntity<?> stopScan() {
        ScanSession session = scanService.stopScan();
        if (session == null) {
            return ResponseEntity.ok(Map.of("message", "No active scan to stop"));
        }
        return ResponseEntity.ok(session);
    }

    @GetMapping("/results")
    public ResponseEntity<Map<String, Object>> getResults() {
        return ResponseEntity.ok(scanService.getScanResults());
    }

    @GetMapping("/status")
    public ResponseEntity<?> getStatus() {
        return ResponseEntity.ok(Map.of("running", scanService.isScanRunning()));
    }
}
