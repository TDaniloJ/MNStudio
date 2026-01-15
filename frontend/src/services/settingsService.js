import api from './api';

export const settingsService = {
  // Obter todas as configurações (admin)
  async getAll() {
    const response = await api.get('/settings');
    return response.data;
  },

  // Obter configuração específica
  async getSetting(key) {
    const response = await api.get(`/settings/${key}`);
    return response.data;
  },

  // Atualizar configuração
  async updateSetting(key, value, isFile = false) {
    if (isFile) {
      const formData = new FormData();
      formData.append('image', value);
      const response = await api.put(`/settings/${key}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response.data;
    } else {
      const response = await api.put(`/settings/${key}`, { value });
      return response.data;
    }
  },

  // Atualizar múltiplas configurações
  async updateMultiple(settings) {
    const response = await api.put('/settings', { settings });
    return response.data;
  },

  // Criar nova configuração
  async createSetting(data) {
    const response = await api.post('/settings', data);
    return response.data;
  },

  // Deletar configuração
  async deleteSetting(key) {
    const response = await api.delete(`/settings/${key}`);
    return response.data;
  },

  // Resetar para padrões
  async resetToDefaults() {
    const response = await api.post('/settings/reset');
    return response.data;
  },

  // Obter configurações públicas
  async getPublicSettings() {
    const response = await api.get('/settings/public');
    return response.data;
  }
};