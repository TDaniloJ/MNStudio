import api from './api';

export const worldbuildingService = {
  // ========== CHARACTERS ==========
  async createCharacter(novelId, data) {
    const formData = new FormData();
    Object.keys(data).forEach(key => {
      if (key === 'strengths' || key === 'weaknesses' || key === 'abilities' || key === 'relationships') {
        formData.append(key, JSON.stringify(data[key]));
      } else if (data[key] !== null && data[key] !== undefined) {
        formData.append(key, data[key]);
      }
    });
    const response = await api.post(`/worldbuilding/novels/${novelId}/characters`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  async getCharacters(novelId) {
    const response = await api.get(`/worldbuilding/novels/${novelId}/characters`);
    return response.data;
  },

  async updateCharacter(characterId, data) {
    const formData = new FormData();
    Object.keys(data).forEach(key => {
      if (key === 'strengths' || key === 'weaknesses' || key === 'abilities' || key === 'relationships') {
        formData.append(key, JSON.stringify(data[key]));
      } else if (data[key] !== null && data[key] !== undefined) {
        formData.append(key, data[key]);
      }
    });
    const response = await api.put(`/worldbuilding/characters/${characterId}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  async deleteCharacter(characterId) {
    const response = await api.delete(`/worldbuilding/characters/${characterId}`);
    return response.data;
  },

  // ========== WORLDS ==========
  async createWorld(novelId, data) {
    const formData = new FormData();
    Object.keys(data).forEach(key => {
      if (key === 'races' || key === 'languages' || key === 'locations' || key === 'resources' || key === 'dangers') {
        formData.append(key, JSON.stringify(data[key]));
      } else if (data[key] !== null && data[key] !== undefined) {
        formData.append(key, data[key]);
      }
    });
    const response = await api.post(`/worldbuilding/novels/${novelId}/worlds`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  async getWorlds(novelId) {
    const response = await api.get(`/worldbuilding/novels/${novelId}/worlds`);
    return response.data;
  },

  async updateWorld(worldId, data) {
    const formData = new FormData();
    Object.keys(data).forEach(key => {
      if (key === 'races' || key === 'languages' || key === 'locations' || key === 'resources' || key === 'dangers') {
        formData.append(key, JSON.stringify(data[key]));
      } else if (data[key] !== null && data[key] !== undefined) {
        formData.append(key, data[key]);
      }
    });
    const response = await api.put(`/worldbuilding/worlds/${worldId}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  async deleteWorld(worldId) {
    const response = await api.delete(`/worldbuilding/worlds/${worldId}`);
    return response.data;
  },

  // ========== MAGIC SYSTEMS ==========
  async createMagicSystem(novelId, data) {
    const response = await api.post(`/worldbuilding/novels/${novelId}/magic-systems`, data);
    return response.data;
  },

  async getMagicSystems(novelId) {
    const response = await api.get(`/worldbuilding/novels/${novelId}/magic-systems`);
    return response.data;
  },

  async updateMagicSystem(systemId, data) {
    const response = await api.put(`/worldbuilding/magic-systems/${systemId}`, data);
    return response.data;
  },

  async deleteMagicSystem(systemId) {
    const response = await api.delete(`/worldbuilding/magic-systems/${systemId}`);
    return response.data;
  },

  // ========== CULTIVATION SYSTEMS ==========
  async createCultivationSystem(novelId, data) {
    const response = await api.post(`/worldbuilding/novels/${novelId}/cultivation-systems`, data);
    return response.data;
  },

  async getCultivationSystems(novelId) {
    const response = await api.get(`/worldbuilding/novels/${novelId}/cultivation-systems`);
    return response.data;
  },

  async updateCultivationSystem(systemId, data) {
    const response = await api.put(`/worldbuilding/cultivation-systems/${systemId}`, data);
    return response.data;
  },

  async deleteCultivationSystem(systemId) {
    const response = await api.delete(`/worldbuilding/cultivation-systems/${systemId}`);
    return response.data;
  },

  // ========== ITEMS ==========
  async createItem(novelId, data) {
    const formData = new FormData();
    Object.keys(data).forEach(key => {
      if (key === 'stats') {
        formData.append(key, JSON.stringify(data[key]));
      } else if (data[key] !== null && data[key] !== undefined) {
        formData.append(key, data[key]);
      }
    });
    const response = await api.post(`/worldbuilding/novels/${novelId}/items`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  async getItems(novelId) {
    const response = await api.get(`/worldbuilding/novels/${novelId}/items`);
    return response.data;
  },

  async updateItem(itemId, data) {
    const formData = new FormData();
    Object.keys(data).forEach(key => {
      if (key === 'stats') {
        formData.append(key, JSON.stringify(data[key]));
      } else if (data[key] !== null && data[key] !== undefined) {
        formData.append(key, data[key]);
      }
    });
    const response = await api.put(`/worldbuilding/items/${itemId}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  async deleteItem(itemId) {
    const response = await api.delete(`/worldbuilding/items/${itemId}`);
    return response.data;
  },

  // ========== ORGANIZATIONS ==========
  async createOrganization(novelId, data) {
    const formData = new FormData();
    Object.keys(data).forEach(key => {
      if (key === 'members' || key === 'hierarchy' || key === 'allies' || key === 'enemies') {
        formData.append(key, JSON.stringify(data[key]));
      } else if (data[key] !== null && data[key] !== undefined) {
        formData.append(key, data[key]);
      }
    });
    const response = await api.post(`/worldbuilding/novels/${novelId}/organizations`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  async getOrganizations(novelId) {
    const response = await api.get(`/worldbuilding/novels/${novelId}/organizations`);
    return response.data;
  },

  async updateOrganization(orgId, data) {
    const formData = new FormData();
    Object.keys(data).forEach(key => {
      if (key === 'members' || key === 'hierarchy' || key === 'allies' || key === 'enemies') {
        formData.append(key, JSON.stringify(data[key]));
      } else if (data[key] !== null && data[key] !== undefined) {
        formData.append(key, data[key]);
      }
    });
    const response = await api.put(`/worldbuilding/organizations/${orgId}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  async deleteOrganization(orgId) {
    const response = await api.delete(`/worldbuilding/organizations/${orgId}`);
    return response.data;
  },

  // ========== TIMELINE ==========
  async createTimelineEvent(novelId, data) {
    const response = await api.post(`/worldbuilding/novels/${novelId}/timeline`, data);
    return response.data;
  },

  async getTimelineEvents(novelId) {
    const response = await api.get(`/worldbuilding/novels/${novelId}/timeline`);
    return response.data;
  },

  async updateTimelineEvent(eventId, data) {
    const response = await api.put(`/worldbuilding/timeline/${eventId}`, data);
    return response.data;
  },

  async deleteTimelineEvent(eventId) {
    const response = await api.delete(`/worldbuilding/timeline/${eventId}`);
    return response.data;
  }
};