package com.example.controller;

import com.example.model.ChatMessage;
import com.example.model.SupportFAQ;
import com.example.repository.ChatMessageRepository;
import com.example.repository.SupportFAQRepository;
import com.example.service.SupportChatService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/support")
@CrossOrigin(origins = "*") // For local dev
public class SupportController {

    private final SupportChatService supportChatService;
    private final ChatMessageRepository chatMessageRepository;
    private final SupportFAQRepository supportFAQRepository;

    public SupportController(SupportChatService supportChatService, ChatMessageRepository chatMessageRepository, SupportFAQRepository supportFAQRepository) {
        this.supportChatService = supportChatService;
        this.chatMessageRepository = chatMessageRepository;
        this.supportFAQRepository = supportFAQRepository;
    }

    @PostMapping("/chat")
    public ResponseEntity<Map<String, String>> chat(@RequestBody Map<String, String> request) {
        String question = request.get("question");
        if (question == null || question.isBlank()) {
            return ResponseEntity.badRequest().build();
        }
        
        String answer = supportChatService.generateSupportAnswer(question);
        return ResponseEntity.ok(Map.of("answer", answer));
    }

    @PostMapping("/faq")
    public ResponseEntity<SupportFAQ> addFAQ(@RequestBody SupportFAQ faq) {
        supportChatService.addFAQ(faq);
        return ResponseEntity.ok(faq);
    }

    @GetMapping("/faq")
    public ResponseEntity<List<SupportFAQ>> getFAQs() {
        return ResponseEntity.ok(supportFAQRepository.findAll());
    }

    @GetMapping("/chat/history")
    public ResponseEntity<List<ChatMessage>> getHistory() {
        return ResponseEntity.ok(chatMessageRepository.findByChatModeOrderByTimestampDesc("SUPPORT"));
    }
}
