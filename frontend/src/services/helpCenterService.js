import api from './api';

export const helpCenterService = {
  getHelpRequests: async (unreadOnly = false, limit = 20, offset = 0) => {
    const { data } = await api.get('/help-requests', {
      params: { unread_only: unreadOnly, limit, offset }
    });

    return {
      helpRequests: data.helpRequests ?? [],
      unreadCount: data.unread_count ?? 0
    };
  },

  createHelpRequest: async (payload) => {
    const { data } = await api.post('/help-requests', payload);
    return data;
  },

  markAsRead: async (id) => {
    const { data } = await api.put(`/help-requests/${id}/read`);
    return data;
  },

  markAllAsRead: async () => {
    const { data } = await api.put('/help-requests/read-all');
    return data;
  },

  deleteHelpRequest: async (id) => {
    const { data } = await api.delete(`/help-requests/${id}`);
    return data;
  }
};
