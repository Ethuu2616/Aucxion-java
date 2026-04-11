package com.aucxion.controller;

import com.aucxion.model.ThreatLog;
import com.aucxion.repository.ThreatLogRepository;
import com.aucxion.service.SecuritySuggestionService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/threats")
@CrossOrigin(origins = "http://localhost:3000")
public class ThreatController {

    private final ThreatLogRepository threatLogRepository;
    private final SecuritySuggestionService suggestionService;

    public ThreatController(ThreatLogRepository threatLogRepository,
                            SecuritySuggestionService suggestionService) {
        this.threatLogRepository = threatLogRepository;
        this.suggestionService = suggestionService;
    }

    @GetMapping
    public ResponseEntity<List<ThreatLog>> getAllThreats() {
        return ResponseEntity.ok(threatLogRepository.findAllByOrderByDetectedAtDesc());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ThreatLog> getThreat(@PathVariable Long id) {
        return threatLogRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/type/{attackType}")
    public ResponseEntity<List<ThreatLog>> getByType(@PathVariable String attackType) {
        return ResponseEntity.ok(threatLogRepository.findByAttackType(attackType.toUpperCase()));
    }

    @GetMapping("/suggestions/{attackType}")
    public ResponseEntity<List<Map<String, String>>> getSuggestions(@PathVariable String attackType) {
        return ResponseEntity.ok(suggestionService.getSuggestionsForType(attackType));
    }

    @GetMapping("/suggestions")
    public ResponseEntity<Map<String, List<Map<String, String>>>> getAllSuggestions() {
        return ResponseEntity.ok(suggestionService.getAllSuggestions());
    }

    @PutMapping("/{id}/resolve")
    public ResponseEntity<ThreatLog> resolveThreat(@PathVariable Long id) {
        return threatLogRepository.findById(id).map(threat -> {
            threat.setStatus("RESOLVED");
            return ResponseEntity.ok(threatLogRepository.save(threat));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/clear")
    public ResponseEntity<?> clearThreats() {
        threatLogRepository.deleteAll();
        return ResponseEntity.ok(Map.of("message", "All threats cleared"));
    }
}
