import api from './api';

export const notificationService = {
  getNotifications: async (unreadOnly = false, limit = 20, offset = 0) => {
    const response = await api.get('/notifications', {
      params: { unread_only: unreadOnly, limit, offset }
    });
    return response.data;
  },

  markAsRead: async (notificationId) => {
    const response = await api.put(`/notifications/${notificationId}/read`);
    return response.data;
  },

  markAllAsRead: async () => {
    const response = await api.put('/notifications/read-all');
    return response.data;
  },

  deleteNotification: async (notificationId) => {
    const response = await api.delete(`/notifications/${notificationId}`);
    return response.data;
  },

  // Admin
  createNotification: async (data) => {
    const response = await api.post('/notifications', data);
    return response.data;
  },

  broadcastNotification: async (data) => {
    const response = await api.post('/notifications/broadcast', data);
    return response.data;
  }
};

export const activityService = {
  getActivities: async (type = null, limit = 20, offset = 0) => {
    const response = await api.get('/activities', {
      params: { type, limit, offset }
    });
    return response.data;
  },

  deleteActivity: async (activityId) => {
    const response = await api.delete(`/activities/${activityId}`);
    return response.data;
  },

  clearActivities: async () => {
    const response = await api.delete('/activities');
    return response.data;
  }
};

export const badgeService = {
  getAllBadges: async () => {
    const response = await api.get('/badges');
    return response.data;
  },

  getUserBadges: async (userId) => {
    const response = await api.get(`/badges/user/${userId}`);
    return response.data;
  },

  createBadge: async (data) => {
    const response = await api.post('/badges', data);
    return response.data;
  },

  awardBadge: async (userId, badgeId) => {
    const response = await api.post('/badges/award', {
      user_id: userId,
      badge_id: badgeId
    });
    return response.data;
  },

  removeBadge: async (userId, badgeId) => {
    const response = await api.delete('/badges', {
      data: { user_id: userId, badge_id: badgeId }
    });
    return response.data;
  }
};
