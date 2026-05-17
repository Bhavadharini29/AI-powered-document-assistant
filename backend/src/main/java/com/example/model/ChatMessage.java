package com.example.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
//afsfsfsfsgsgsg
@Entity
@Table(name = "chat_messages")
public class ChatMessage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(columnDefinition = "TEXT")
    private String question;

    @Column(columnDefinition = "TEXT")
    private String answer;
    
    private String chatMode; // KNOWLEDGE or SUPPORT
    
    private LocalDateTime timestamp = LocalDateTime.now();

    public ChatMessage() {}

    public ChatMessage(String question, String answer, String chatMode) {
        this.question = question;
        this.answer = answer;
        this.chatMode = chatMode;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getQuestion() { return question; }
    public void setQuestion(String question) { this.question = question; }
    public String getAnswer() { return answer; }
    public void setAnswer(String answer) { this.answer = answer; }
    public String getChatMode() { return chatMode; }
    public void setChatMode(String chatMode) { this.chatMode = chatMode; }
    public LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }
}
