import api from './api';

export const subscriptionService = {
  // 📦 buscar planos
  async getAllPlans() {
    const res = await api.get('/subscriptions/plans');
    return res.data;
  },

  // ➕ criar plano
  async createPlan(data) {
    const res = await api.post('/subscriptions/plans', data);
    return res.data;
  },

  // ✏️ atualizar plano
  async updatePlan(id, data) {
    const res = await api.put(`/subscriptions/plans/${id}`, data);
    return res.data;
  },

  // 🗑️ deletar plano
  async deletePlan(id) {
    const res = await api.delete(`/subscriptions/plans/${id}`);
    return res.data;
  },

  // 👤 minha assinatura
  async getMySubscription() {
    const res = await api.get('/subscriptions/me');
    return res.data;
  },

  // 🚀 assinar
  async subscribe(planId) {
    const res = await api.post('/subscriptions/subscribe', { planId });
    return res.data;
  },

  // ❌ cancelar
  async cancel() {
    const res = await api.post('/subscriptions/cancel');
    return res.data;
  },
};