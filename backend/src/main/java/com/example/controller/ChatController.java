package com.example.controller;

import com.example.model.ChatMessage;
import com.example.repository.ChatMessageRepository;
import com.example.service.RagService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/chat")
@CrossOrigin(origins = "*") // For local dev
public class ChatController {

    private final RagService ragService;
    private final ChatMessageRepository chatMessageRepository;

    public ChatController(RagService ragService, ChatMessageRepository chatMessageRepository) {
        this.ragService = ragService;
        this.chatMessageRepository = chatMessageRepository;
    }

    @PostMapping
    public ResponseEntity<Map<String, String>> chat(@RequestBody Map<String, String> request) {
        String question = request.get("question");
        if (question == null || question.isBlank()) {
            return ResponseEntity.badRequest().build();
        }
        
        String answer = ragService.generateAnswer(question);
        return ResponseEntity.ok(Map.of("answer", answer));
    }

    @GetMapping("/history")
    public ResponseEntity<List<ChatMessage>> getHistory() {
        // Return latest history
        return ResponseEntity.ok(chatMessageRepository.findByChatModeOrderByTimestampDesc("KNOWLEDGE"));
    }
}
