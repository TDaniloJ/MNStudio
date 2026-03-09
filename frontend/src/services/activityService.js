import api from './api';

export const activityService = {
    async getUserActivities(userId) {
        const response = await api.get(`/users/${userId}/activities`); //stats/me
        return response.data;
    },

    async getActivityById(activityId) {
        const response = await api.get(`/activities/${activityId}`);
        return response.data;
    },

    async updateActivity(activityId, activityData) {
        const response = await api.put(`/activities/${activityId}`, activityData);
        return response.data;
    },

    async getRecentActivities(userId) {
        const response = await api.get(`/users/${userId}/activities/recent`);
        return response.data;
    }
};

// Compatibilidade: obter atividades do usuário logado (usado por Profile.jsx)
activityService.getMyActivity = async function(limit = 10) {
    const response = await api.get('/activities', { params: { limit } });
    // Retornar array direto quando o controller responde { activities, total }
    if (response.data.activities) return response.data.activities;
    return response.data;
};