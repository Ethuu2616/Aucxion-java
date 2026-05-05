package com.aucxion.controller;

import com.aucxion.model.ThreatLog;
import com.aucxion.service.ThreatDetectionService;
import com.aucxion.service.SecuritySuggestionService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/threats")
@CrossOrigin(origins = "http://localhost:3000")
public class ThreatController {

    private final ThreatDetectionService threatDetectionService;
    private final SecuritySuggestionService securitySuggestionService;

    public ThreatController(ThreatDetectionService threatDetectionService,
                           SecuritySuggestionService securitySuggestionService) {
        this.threatDetectionService = threatDetectionService;
        this.securitySuggestionService = securitySuggestionService;
    }

    @GetMapping
    public ResponseEntity<List<ThreatLog>> getAllThreats() {
        return ResponseEntity.ok(threatDetectionService.getAllThreats());
    }

    @GetMapping("/suggestions")
    public ResponseEntity<Map<String, List<Map<String, String>>>> getAllSuggestions() {
        return ResponseEntity.ok(securitySuggestionService.getAllSuggestions());
    }

    @GetMapping("/suggestions/{type}")
    public ResponseEntity<List<Map<String, String>>> getSuggestionsByType(@PathVariable String type) {
        return ResponseEntity.ok(securitySuggestionService.getSuggestionsForType(type));
    }

    @DeleteMapping("/clear")
    public ResponseEntity<Map<String, String>> clearAllThreats() {
        threatDetectionService.clearAllThreats();
        return ResponseEntity.ok(Map.of("message", "All threats cleared"));
    }
}
