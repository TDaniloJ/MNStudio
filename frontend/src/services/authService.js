// services/authService.js - ATUALIZADO
import api from './api';

export const authService = {
  async register(data) {
    const response = await api.post('/auth/register', data);
    return response.data;
  },

  async login(data) {
    const response = await api.post('/auth/login', data);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  async getMe() {
    const response = await api.get('/auth/me');
    return response.data;
  },

  async updateProfile(data) {
    // Aceita tanto um objeto simples quanto um FormData já construído
    let payload = data;
    if (!(data instanceof FormData)) {
      payload = new FormData();
      Object.keys(data).forEach(key => {
        if (data[key] !== undefined && data[key] !== null) payload.append(key, data[key]);
      });
    }
    // Não setar Content-Type manualmente para permitir que o axios inclua boundary
    const response = await api.put('/auth/profile', payload);
    return response.data;
  },

  async updateBanner(data) {
    // data deve ser um FormData contendo o campo 'banner'
    const response = await api.put('/auth/banner', data);
    return response.data;
  },

  async deleteBanner() {
    const response = await api.delete('/auth/banner');
    return response.data;
  },

  async changePassword(data) {
    const response = await api.put('/auth/change-password', data);
    return response.data;
  },

  // 🔐 NOVOS MÉTODOS PARA AS FUNCIONALIDADES DO PERFIL
  async sendVerificationEmail() {
    const response = await api.post('/auth/verify-email/send');
    return response.data;
  },

  async getActiveSessions() {
    const response = await api.get('/auth/sessions');
    return response.data;
  },

  async revokeSession(sessionId) {
    const response = await api.delete(`/auth/sessions/${sessionId}`);
    return response.data;
  },

  async revokeAllSessions() {
    const response = await api.delete('/auth/sessions');
    return response.data;
  },

  async setup2FA() {
    const response = await api.post('/auth/2fa/setup');
    return response.data;
  },

  async confirm2FA(data) {
    const response = await api.post('/auth/2fa/confirm', data);
    return response.data;
  },

  async disable2FA() {
    const response = await api.delete('/auth/2fa');
    return response.data;
  },

  async getPreferences() {
    const response = await api.get('/auth/preferences');
    return response.data;
  },

  async updatePreferences(data) {
    const response = await api.put('/auth/preferences', data);
    return response.data;
  },

  async exportUserData() {
    const response = await api.get('/auth/export-data');
    return response.data;
  },

  async deleteAccount() {
    const response = await api.delete('/auth/account');
    return response.data;
  },

  async requestPasswordReset(email) {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  },

  async resetPassword(token, newPassword) {
    const response = await api.post('/auth/reset-password', { token, newPassword });
    return response.data;
  },

  async unlinkGoogle() {
    const response = await api.delete('/auth/google');
    return response.data;
  },

  async verifyEmail(token) {
    const response = await api.post('/auth/verify-email', { token });
    return response.data;
  },

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  },

  isAuthenticated() {
    return !!localStorage.getItem('token');
  },

  getUser() {
    const raw = localStorage.getItem('user');
    if (!raw) return null;
    try {
      // Protege contra valores não JSON (ex: "undefined")
      return JSON.parse(raw);
    } catch (err) {
      console.warn('authService.getUser: valor inválido em localStorage `user`, removendo.', raw);
      localStorage.removeItem('user');
      return null;
    }
  }
};