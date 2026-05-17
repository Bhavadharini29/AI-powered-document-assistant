# RAG Document Chatbot using Spring AI 

This is a complete Retrieval-Augmented Generation (RAG) chatbot application.

## Features
1. **Knowledge Base Assistant**: Upload PDF documents, automatically index them in pgvector, and ask questions about the contents.
2. **Customer Support Assistant**: Answers frequently asked questions (FAQs).
3. **Embeddings & Vector Search**: Powered by pgvector and Google's Gemini models.
4. **Chat History**: Saves all interactions to the database.

## Prerequisites
- PostgreSQL (local install) or Docker & Docker Compose
- Free Google Gemini API Key

## Setup & Running Locally

1. Head over to [Google AI Studio](https://aistudio.google.com/app/apikey) and generate a **free API key**.
2. Open your terminal in the `rag-chatbot` folder and export the key:
   ```powershell
   $env:GEMINI_API_KEY="your_api_key_here"
   ```

3. Ensure Postgres has required extensions (run once as the `postgres` user):

   ```powershell
   # If you are using Docker pgvector (recommended on Windows):
   docker exec rag_chatbot_db psql -U raguser -d ragdb -c "CREATE EXTENSION IF NOT EXISTS vector;"
   docker exec rag_chatbot_db psql -U raguser -d ragdb -c "CREATE EXTENSION IF NOT EXISTS hstore;"
   docker exec rag_chatbot_db psql -U raguser -d ragdb -c "CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\";"
   ```

4. Start the backend:

   ```powershell
   cd .\backend
   .\mvnw.cmd spring-boot:run
   ```

5. Start the frontend (new terminal):

   ```powershell
   cd .\frontend
   npm install
   npm run dev
   ```

### Optional: Run Postgres with Docker

If you prefer Docker for Postgres, run:

```bash
docker compose up -d
```

3. Access the Application:
   - Frontend: `http://localhost:5173`
   - Backend APIs: `http://localhost:8080/chat`, `http://localhost:8080/documents/upload`, etc.

## Populating FAQs for Customer Support

To prefill the Customer Support FAQ data, you can send POST requests to the backend:

```bash
curl -X POST http://localhost:8080/support/faq \
-H "Content-Type: application/json" \
-d '{"question": "How long does shipping take?", "answer": "Standard shipping usually takes 3-5 business days."}'

curl -X POST http://localhost:8080/support/faq \
-H "Content-Type: application/json" \
-d '{"question": "What is your return policy?", "answer": "You can return your item within 30 days of receipt."}'
```
Now ask the Customer Support Assistant "How long till it ships?" and it will answer based on the loaded FAQs!
