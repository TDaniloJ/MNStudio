import api from './api';

export const statsService = {
    async getMyStats() {
        const response = await api.get('/users/me/stats'); //stats/me
        return response.data;
    }
};