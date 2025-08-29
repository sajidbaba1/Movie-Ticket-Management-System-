import api from './api';

export const chatService = {
  async ask(message: string): Promise<{ answer: string; role: string }> {
    const res = await api.post('/chat/ask', { message });
    return res.data;
  },
};
