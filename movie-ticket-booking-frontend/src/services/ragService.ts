import apiClient from './api';

export interface RagChatRequest {
  question: string;
}

export interface RagChatResponse {
  answer: string;
  sources?: Array<{ id: string; title?: string; page?: number; snippet?: string }>;
}

export const ragService = {
  async indexPdf(file: File) {
    const form = new FormData();
    form.append('file', file);
    const res = await apiClient.post('/rag/index-report', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },

  async chat(question: string) {
    const payload: RagChatRequest = { question };
    const res = await apiClient.post<RagChatResponse>('/rag/chat', payload);
    return res.data;
  },
};
