import api from './api';

export const coinService = {
  async getBalance() {
    const response = await api.get('/coins/balance');
    return response.data;
  },

  async getTransactions(limit = 50) {
    const response = await api.get('/coins/transactions', { params: { limit } });
    return response.data;
  },

  async getPackages() {
    const response = await api.get('/coins/packages');
    return response.data;
  },

  async purchasePackage(packageId, paymentMethod = 'mock') {
    const response = await api.post('/coins/purchase', {
      package_id: packageId,
      payment_method: paymentMethod
    });
    return response.data;
  },

  async spendCoins(amount, description, metadata = {}) {
    const response = await api.post('/coins/spend', {
      amount,
      description,
      reference_id: `SPEND-${Date.now()}`,
      metadata
    });
    return response.data;
  },

  async addBonus(userId, amount, description) {
    const response = await api.post('/coins/bonus', {
      user_id: userId,
      amount,
      description
    });
    return response.data;
  },

  async getStats() {
    const response = await api.get('/coins/stats');
    return response.data;
  }
};