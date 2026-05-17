package com.example.service;

import com.example.model.UploadedDocument;
import com.example.repository.DocumentRepository;
import org.springframework.ai.document.Document;
import org.springframework.ai.reader.ExtractedTextFormatter;
import org.springframework.ai.reader.pdf.PagePdfDocumentReader;
import org.springframework.ai.reader.pdf.config.PdfDocumentReaderConfig;
import org.springframework.ai.transformer.splitter.TokenTextSplitter;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@Service
public class DocumentIngestionService {

    private final VectorStore vectorStore;
    private final DocumentRepository documentRepository;

    public DocumentIngestionService(VectorStore vectorStore, DocumentRepository documentRepository) {
        this.vectorStore = vectorStore;
        this.documentRepository = documentRepository;
    }

    public UploadedDocument ingest(MultipartFile file) throws IOException {
        String filename = file.getOriginalFilename();
        Long fileSize = file.getSize();

        // 1. Read PDF
        ByteArrayResource resource = new ByteArrayResource(file.getBytes());
        PagePdfDocumentReader pdfReader = new PagePdfDocumentReader(
                resource,
                PdfDocumentReaderConfig.builder()
                        .withPageExtractedTextFormatter(ExtractedTextFormatter.builder()
                                .withNumberOfBottomTextLinesToDelete(0)
                                .withNumberOfTopPagesToSkipBeforeDelete(0)
                                .build())
                        .withPagesPerDocument(1)
                        .build()
        );

        List<Document> documents = pdfReader.get();

        // Add metadata
        documents.forEach(doc -> {
            doc.getMetadata().put("type", "document");
            doc.getMetadata().put("filename", filename);
        });

        // 2. Split into chunks
        // Faster uploads: bigger chunks + less overlap => fewer embeddings to compute.
        TokenTextSplitter splitter = new TokenTextSplitter(3000, 100, 5, 10000, true);
        List<Document> splitDocuments = splitter.apply(documents);

        // 3. Store into VectorStore
        vectorStore.add(splitDocuments);

        // 4. Save to DB
        UploadedDocument uploadedDoc = new UploadedDocument(filename, fileSize);
        return documentRepository.save(uploadedDoc);
    }
}
