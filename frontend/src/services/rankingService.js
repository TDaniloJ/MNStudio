import api from './api';

export const rankingService = {
  async getMangaRankings(type = 'views', period = 'all', limit = 50) {
    const response = await api.get('/rankings/mangas', {
      params: { type, period, limit }
    });
    return response.data;
  },

  async getNovelRankings(type = 'views', period = 'all', limit = 50) {
    const response = await api.get('/rankings/novels', {
      params: { type, period, limit }
    });
    return response.data;
  },

  async getGlobalRankings(type = 'views', limit = 50) {
    const response = await api.get('/rankings/global', {
      params: { type, limit }
    });
    return response.data;
  },

  async getUserRankings(type = 'uploads', limit = 50) {
    const response = await api.get('/rankings/users', {
      params: { type, limit }
    });
    return response.data;
  },

  async getGlobalStats() {
    const response = await api.get('/rankings/stats');
    return response.data;
  }
};