package com.aucxion.controller;

import com.aucxion.model.PortScanResult;
import com.aucxion.service.PortScannerService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/ports")
@CrossOrigin(origins = "http://localhost:3000")
public class PortController {

    private final PortScannerService portScannerService;

    public PortController(PortScannerService portScannerService) {
        this.portScannerService = portScannerService;
    }

    @GetMapping
    public ResponseEntity<List<PortScanResult>> getAllPorts() {
        return ResponseEntity.ok(portScannerService.getAllResults());
    }

    @GetMapping("/open")
    public ResponseEntity<List<PortScanResult>> getOpenPorts() {
        return ResponseEntity.ok(portScannerService.getOpenPorts());
    }

    @PostMapping("/scan")
    public ResponseEntity<List<PortScanResult>> scanPorts() {
        return ResponseEntity.ok(portScannerService.scanPorts());
    }
}
