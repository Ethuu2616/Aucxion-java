package com.aucxion.controller;

import com.aucxion.service.ChatbotService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/chat")
@CrossOrigin(origins = "http://localhost:3000")
public class ChatbotController {

    private final ChatbotService chatbotService;

    public ChatbotController(ChatbotService chatbotService) {
        this.chatbotService = chatbotService;
    }

    @PostMapping
    public ResponseEntity<Map<String, String>> chat(@RequestBody Map<String, String> body) {
        String message = body.getOrDefault("message", "").trim();
        if (message.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "No message provided"));
        }
        if (message.length() > 500) {
            return ResponseEntity.badRequest().body(Map.of("error", "Message too long"));
        }
        String reply = chatbotService.getResponse(message);
        return ResponseEntity.ok(Map.of("reply", reply));
    }
}
