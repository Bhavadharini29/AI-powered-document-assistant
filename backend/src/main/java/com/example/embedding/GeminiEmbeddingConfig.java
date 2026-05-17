package com.example.embedding;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.ai.embedding.EmbeddingModel;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.core.env.Environment;
import org.springframework.web.client.RestClient;

@Configuration
@ConditionalOnProperty(name = "app.embedding.provider", havingValue = "gemini")
public class GeminiEmbeddingConfig {

    @Bean
    @Primary
    public EmbeddingModel geminiEmbeddingModel(ObjectMapper objectMapper, Environment env) {
        String apiKey = env.getProperty("GEMINI_API_KEY");
        // Matches Google docs: "models/gemini-embedding-001"
        String model = env.getProperty("GEMINI_EMBEDDING_MODEL", "gemini-embedding-001");

        RestClient restClient = RestClient.builder()
                .baseUrl("https://generativelanguage.googleapis.com/v1beta")
                .build();

        return new GeminiEmbeddingModel(restClient, objectMapper, apiKey, model);
    }
}

