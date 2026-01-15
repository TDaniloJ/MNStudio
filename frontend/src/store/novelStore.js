import { create } from 'zustand';
import { novelService } from '../services/novelService';

export const useNovelStore = create((set, get) => ({
  novels: [],
  currentNovel: null,
  loading: false,
  pagination: { total: 0, page: 1, pages: 1 },

  fetchNovels: async (params) => {
    set({ loading: true });
    try {
      const data = await novelService.getAll(params);
      set({ 
        novels: data.novels, 
        pagination: data.pagination, 
        loading: false 
      });
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },

  fetchNovelById: async (id) => {
    set({ loading: true });
    try {
      const data = await novelService.getById(id);
      set({ currentNovel: data.novel, loading: false });
      return data.novel;
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },

  clearCurrentNovel: () => set({ currentNovel: null })
}));