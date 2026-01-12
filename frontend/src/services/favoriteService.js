import api from './api';

export const favoriteService = {
  async addFavorite(contentType, contentId) {
    const response = await api.post('/favorites', {
      content_type: contentType,
      content_id: contentId
    });
    return response.data;
  },

  async removeFavorite(contentType, contentId) {
    const response = await api.delete(`/favorites/${contentType}/${contentId}`);
    return response.data;
  },

  async getUserFavorites(type) {
    const response = await api.get('/favorites', { params: { type } });
    return response.data;
  },

  async checkFavorite(contentType, contentId) {
    const response = await api.get(`/favorites/${contentType}/${contentId}`);
    return response.data;
  }
};