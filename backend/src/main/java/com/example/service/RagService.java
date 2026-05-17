package com.example.service;

import com.example.model.ChatMessage;
import com.example.repository.ChatMessageRepository;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.document.Document;
import org.springframework.ai.vectorstore.SearchRequest;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.web.client.RestClientResponseException;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class RagService {

    private final ChatClient chatClient;
    private final VectorStore vectorStore;
    private final ChatMessageRepository chatMessageRepository;

    public RagService(ChatClient.Builder chatClientBuilder, VectorStore vectorStore, ChatMessageRepository chatMessageRepository) {
        this.chatClient = chatClientBuilder.build();
        this.vectorStore = vectorStore;
        this.chatMessageRepository = chatMessageRepository;
    }

    public String generateAnswer(String question) {
        // 1. Retrieve relevant documents
        List<Document> similarDocuments = vectorStore.similaritySearch(
                SearchRequest.builder()
                        .query(question)
                        .topK(2)
                        .filterExpression("type == 'document'")
                        .build()
        );

        String contextInfo = similarDocuments.stream()
                .map(Document::getText)
                .collect(Collectors.joining("\n\n"));

        // 2. Build prompt and call LLM
        String systemPrompt = """
                You are a helpful knowledge-base assistant.
                Use the following retrieved context to answer the user's question.
                If you don't know the answer based on the context, say that you don't know.

                Context:
                """ + contextInfo;

        final String answer;
        try {
            answer = chatClient.prompt()
                    .system(systemPrompt)
                    .user(question)
                    .call()
                    .content();
        } catch (RestClientResponseException e) {
            // Gemini (OpenAI-compatible) returns quota errors as 429; surface a helpful message to the UI.
            if (e.getStatusCode().value() == 429) {
                return "Gemini quota/rate limit exceeded right now. Please wait a minute and try again, or enable billing/increase quota for your Google AI project.";
            }
            return "The AI service returned an error (" + e.getStatusCode().value() + "). Please try again.";
        } catch (Exception e) {
            return "The AI service failed unexpectedly. Please try again.";
        }

        // 3. Save to history
        chatMessageRepository.save(new ChatMessage(question, answer, "KNOWLEDGE"));

        return answer;
    }
}
