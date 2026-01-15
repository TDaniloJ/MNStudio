import api from './api';

export const readingHistoryService = {
  async saveProgress(data) {
    const response = await api.post('/reading-history', data);
    return response.data;
  },

  async getHistory(limit = 20) {
    const response = await api.get('/reading-history', { params: { limit } });
    return response.data;
  },

  async clearHistory() {
    const response = await api.delete('/reading-history');
    return response.data;
  }
};