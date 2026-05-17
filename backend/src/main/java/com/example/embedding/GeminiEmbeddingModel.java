package com.example.embedding;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.ai.chat.metadata.EmptyUsage;
import org.springframework.ai.document.Document;
import org.springframework.ai.embedding.Embedding;
import org.springframework.ai.embedding.EmbeddingOptions;
import org.springframework.ai.embedding.EmbeddingRequest;
import org.springframework.ai.embedding.EmbeddingResponse;
import org.springframework.ai.embedding.EmbeddingResponseMetadata;
import org.springframework.ai.embedding.AbstractEmbeddingModel;
import org.springframework.http.MediaType;
import org.springframework.util.Assert;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientResponseException;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * Minimal embedding model for Google Gemini Embeddings API.
 *
 * This avoids Spring AI's OpenAI-compatible embedding client, which can throw
 * NPEs when a provider omits the "usage" field in embedding responses.
 */
public final class GeminiEmbeddingModel extends AbstractEmbeddingModel {

    private final RestClient restClient;
    private final ObjectMapper objectMapper;
    private final String apiKey;
    private final String model;

    public GeminiEmbeddingModel(RestClient restClient, ObjectMapper objectMapper, String apiKey, String model) {
        Assert.notNull(restClient, "restClient must not be null");
        Assert.notNull(objectMapper, "objectMapper must not be null");
        Assert.hasText(apiKey, "GEMINI_API_KEY must be set");
        Assert.hasText(model, "model must not be blank");
        this.restClient = restClient;
        this.objectMapper = objectMapper;
        this.apiKey = apiKey;
        this.model = model;
    }

    @Override
    public EmbeddingResponse call(EmbeddingRequest request) {
        List<String> inputs = request.getInstructions();
        EmbeddingOptions options = request.getOptions();
        // Options currently ignored; keep behavior stable.
        List<Embedding> results = new ArrayList<>(inputs.size());

        for (int i = 0; i < inputs.size(); i++) {
            float[] vector = embedText(inputs.get(i));
            results.add(new Embedding(vector, i));
        }

        EmbeddingResponseMetadata metadata = new EmbeddingResponseMetadata(this.model, new EmptyUsage());
        return new EmbeddingResponse(results, metadata);
    }

    @Override
    public float[] embed(Document document) {
        Assert.notNull(document, "document must not be null");
        return embedText(document.getText());
    }

    private float[] embedText(String text) {
        Assert.hasText(text, "text must not be blank");

        Map<String, Object> body = new LinkedHashMap<>();
        Map<String, Object> content = new LinkedHashMap<>();
        content.put("parts", List.of(Map.of("text", text)));
        body.put("content", content);

        String json = null;
        int maxAttempts = 6;
        long backoffMs = 750;
        for (int attempt = 1; attempt <= maxAttempts; attempt++) {
            try {
                json = this.restClient
                        .post()
                        .uri(uriBuilder -> uriBuilder
                                .path("/models/{model}:embedContent")
                                .queryParam("key", this.apiKey)
                                .build(this.model))
                        .contentType(MediaType.APPLICATION_JSON)
                        .accept(MediaType.APPLICATION_JSON)
                        .body(body)
                        .retrieve()
                        .body(String.class);
                break;
            } catch (RestClientResponseException e) {
                // 429 = rate limited / quota burst; backoff then retry
                if (e.getStatusCode().value() == 429 && attempt < maxAttempts) {
                    sleepQuietly(backoffMs);
                    backoffMs = Math.min(backoffMs * 2, 8000);
                    continue;
                }
                throw e;
            }
        }
        if (json == null) {
            throw new IllegalStateException("No embeddings response received.");
        }

        try {
            JsonNode root = this.objectMapper.readTree(json);
            JsonNode values = root.path("embedding").path("values");
            if (!values.isArray() || values.isEmpty()) {
                throw new IllegalStateException("Unexpected embeddings response: " + json);
            }
            float[] out = new float[values.size()];
            for (int i = 0; i < values.size(); i++) {
                out[i] = (float) values.get(i).asDouble();
            }
            return out;
        } catch (Exception e) {
            throw new IllegalStateException("Failed to parse embeddings response", e);
        }
    }

    private static void sleepQuietly(long ms) {
        try {
            Thread.sleep(ms);
        } catch (InterruptedException ie) {
            Thread.currentThread().interrupt();
        }
    }
}

