import api from './api';

export const ratingService = {
  async submitRating(contentType, contentId, score) {
    const body = { content_type: contentType, content_id: contentId, score };
    const response = await api.post('/rankings/ratings', body);
    return response.data;
  },

  async getRatings(contentType, contentId) {
    const response = await api.get(`/rankings/ratings/${contentType}/${contentId}`);
    return response.data;
  }
};

export default ratingService;
