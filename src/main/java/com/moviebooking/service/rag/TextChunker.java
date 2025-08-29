package com.moviebooking.service.rag;

import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

@Component
public class TextChunker {
    public List<String> chunk(String text, int chunkSize, int overlap) {
        List<String> chunks = new ArrayList<>();
        if (text == null || text.isEmpty()) return chunks;
        int start = 0;
        int len = text.length();
        while (start < len) {
            int end = Math.min(len, start + chunkSize);
            String chunk = text.substring(start, end);
            chunks.add(chunk);
            if (end >= len) break;
            start = Math.max(start + chunkSize - overlap, start + 1);
        }
        return chunks;
    }
}
