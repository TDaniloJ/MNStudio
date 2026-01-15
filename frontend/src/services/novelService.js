import api from './api';

export const novelService = {
  async getAll(params) {
    const response = await api.get('/novels', { params });
    return response.data;
  },

  async getById(id) {
    const response = await api.get(`/novels/${id}`);
    return response.data;
  },

  async create(formData) {
    console.log('🚀 Enviando novel...');
    
    const response = await api.post('/novels', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    
    console.log('✅ Resposta:', response.data);
    return response.data;
  },

  async update(id, formData) {
    console.log('🔄 Atualizando novel...');
    
    const response = await api.put(`/novels/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    
    return response.data;
  },

  async delete(id) {
    const response = await api.delete(`/novels/${id}`);
    return response.data;
  },

  async createChapter(novelId, data) {
    const response = await api.post(`/novels/${novelId}/chapters`, data);
    return response.data;
  },

  async getChapter(chapterId) {
    const response = await api.get(`/novels/chapters/${chapterId}`);
    return response.data;
  },

  async updateChapter(chapterId, data) {
    const response = await api.put(`/novels/chapters/${chapterId}`, data);
    return response.data;
  },

  async getNovelChapters(novelId) {
    const response = await api.get(`/novels/${novelId}/chapters`);
    return response.data;
  },

  async deleteChapter(chapterId) {
    const response = await api.delete(`/novels/chapters/${chapterId}`);
    return response.data;
  }
};