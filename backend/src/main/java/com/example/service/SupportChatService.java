package com.example.service;

import com.example.model.ChatMessage;
import com.example.model.SupportFAQ;
import com.example.repository.ChatMessageRepository;
import com.example.repository.SupportFAQRepository;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.document.Document;
import org.springframework.ai.vectorstore.SearchRequest;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientResponseException;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class SupportChatService {

    private final ChatClient chatClient;
    private final VectorStore vectorStore;
    private final ChatMessageRepository chatMessageRepository;
    private final SupportFAQRepository supportFAQRepository;

    public SupportChatService(ChatClient.Builder chatClientBuilder, VectorStore vectorStore,
                               ChatMessageRepository chatMessageRepository, SupportFAQRepository supportFAQRepository) {
        this.chatClient = chatClientBuilder.build();
        this.vectorStore = vectorStore;
        this.chatMessageRepository = chatMessageRepository;
        this.supportFAQRepository = supportFAQRepository;
    }

    public void addFAQ(SupportFAQ faq) {
        supportFAQRepository.save(faq);
        Document doc = new Document(
                "Q: " + faq.getQuestion() + "\nA: " + faq.getAnswer(),
                Map.of("type", "faq", "faqId", String.valueOf(faq.getId()))
        );
        vectorStore.add(List.of(doc));
    }

    public String generateSupportAnswer(String question) {
        List<Document> similarFaqs = vectorStore.similaritySearch(
                SearchRequest.builder()
                        .query(question)
                        .topK(3)
                        .filterExpression("type == 'faq'")
                        .build()
        );

        String faqContext = similarFaqs.stream()
                .map(Document::getText)
                .collect(Collectors.joining("\n\n"));

        String systemPrompt = """
                You are a customer support virtual assistant.
                Answer the customer's question based strictly on the following FAQ context.
                If the answer is not contained in the FAQ, say that you apologize but you cannot help with that question, and suggest contacting a human representative.

                FAQ Context:
                """ + faqContext;

        final String answer;
        try {
            answer = chatClient.prompt()
                    .system(systemPrompt)
                    .user(question)
                    .call()
                    .content();
        } catch (RestClientResponseException e) {
            if (e.getStatusCode().value() == 429) {
                return "Gemini quota/rate limit exceeded right now. Please wait a minute and try again, or enable billing/increase quota for your Google AI project.";
            }
            return "The AI service returned an error (" + e.getStatusCode().value() + "). Please try again.";
        } catch (Exception e) {
            return "The AI service failed unexpectedly. Please try again.";
        }

        chatMessageRepository.save(new ChatMessage(question, answer, "SUPPORT"));

        return answer;
    }
}
