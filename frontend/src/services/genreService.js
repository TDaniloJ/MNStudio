import api from './api';

export const genreService = {
  async getAll() {
    const response = await api.get('/genres');
    return response.data;
  },

  async create(data) {
    const response = await api.post('/genres', data);
    return response.data;
  },

  async delete(id) {
    const response = await api.delete(`/genres/${id}`);
    return response.data;
  }
};