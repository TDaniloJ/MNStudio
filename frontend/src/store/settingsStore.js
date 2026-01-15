import { create } from 'zustand';
import { settingsService } from '../services/settingsService';

export const useSettingsStore = create((set, get) => ({
  settings: {},
  publicSettings: {},
  loading: false,

  // Carregar configurações públicas
  loadPublicSettings: async () => {
    try {
      const data = await settingsService.getPublicSettings();
      set({ publicSettings: data.settings });
      
      // Aplicar configurações visuais
      if (data.settings.primary_color) {
        document.documentElement.style.setProperty('--color-primary', data.settings.primary_color);
      }
      
      // Atualizar título e favicon
      if (data.settings.site_name) {
        document.title = data.settings.site_name;
      }
      
      if (data.settings.site_favicon) {
        const link = document.querySelector("link[rel*='icon']") || document.createElement('link');
        link.type = 'image/x-icon';
        link.rel = 'shortcut icon';
        link.href = `http://localhost:5000${data.settings.site_favicon}`;
        document.getElementsByTagName('head')[0].appendChild(link);
      }
    } catch (error) {
      console.error('Erro ao carregar configurações públicas:', error);
    }
  },

  // Carregar todas as configurações (admin)
  loadSettings: async () => {
    try {
      set({ loading: true });
      const data = await settingsService.getAll();
      set({ settings: data.settings, loading: false });
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },

  // Atualizar configuração
  updateSetting: async (key, value, isFile = false) => {
    try {
      await settingsService.updateSetting(key, value, isFile);
      await get().loadSettings();
    } catch (error) {
      throw error;
    }
  },

  // Resetar para padrões
  resetToDefaults: async () => {
    try {
      await settingsService.resetToDefaults();
      await get().loadSettings();
    } catch (error) {
      throw error;
    }
  }
}));