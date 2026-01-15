import { create } from 'zustand';
import { mangaService } from '../services/mangaService';

export const useMangaStore = create((set, get) => ({
  mangas: [],
  currentManga: null,
  loading: false,
  pagination: { total: 0, page: 1, pages: 1 },

  fetchMangas: async (params) => {
    set({ loading: true });
    try {
      const data = await mangaService.getAll(params);
      set({ 
        mangas: data.mangas, 
        pagination: data.pagination, 
        loading: false 
      });
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },

  fetchMangaById: async (id) => {
    set({ loading: true });
    try {
      const data = await mangaService.getById(id);
      set({ currentManga: data.manga, loading: false });
      return data.manga;
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },

  clearCurrentManga: () => set({ currentManga: null })
}));