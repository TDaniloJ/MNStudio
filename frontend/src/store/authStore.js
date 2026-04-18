import { create } from 'zustand';
import { authService } from '../services/authService';

export const useAuthStore = create((set) => ({
  user: authService.getUser(),
  isAuthenticated: authService.isAuthenticated(),
  loading: false,

  login: async (credentials) => {
    set({ loading: true });
    try {
      const data = await authService.login(credentials);

      // ✅ buscar dados completos
      const me = await authService.getMe();

      set({
        user: me.user,
        isAuthenticated: true,
        loading: false
      });

      localStorage.setItem('user', JSON.stringify(me.user));

      return data;
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },

  register: async (userData) => {
    set({ loading: true });
    try {
      const data = await authService.register(userData);
      set({ user: data.user, isAuthenticated: true, loading: false });
      return data;
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },

  logout: () => {
    authService.logout();
    set({ user: null, isAuthenticated: false });
  },

  updateUser: (userData) => {
    set((state) => {
      const updatedUser = {
        ...state.user,
        ...userData,
      };

      localStorage.setItem('user', JSON.stringify(updatedUser));

      return {
        user: updatedUser,
        isAuthenticated: true,
      };
    });
  }
}));