import { create } from 'zustand';
import { User } from '../types';
import * as authService from '../services/auth';

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
  
  // Actions
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  updateUser: (updates: Partial<User>) => Promise<void>;
  setError: (error: string | null) => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  isLoading: false,
  isAuthenticated: false,
  error: null,

  login: async (email, password) => {
    try {
      set({ isLoading: true, error: null });
      
      const response = await authService.login({ email, password });
      
      set({
        user: response.user,
        token: response.token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
    } catch (error: any) {
      set({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: error.message || 'Giriş başarısız',
      });
      throw error;
    }
  },

  logout: async () => {
    try {
      set({ isLoading: true });
      
      await authService.logout();
      
      set({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
    } catch (error: any) {
      console.error('Logout error:', error);
      set({ isLoading: false });
    }
  },

  checkAuth: async () => {
    try {
      set({ isLoading: true });
      
      const [isAuthenticated, user] = await Promise.all([
        authService.isAuthenticated(),
        authService.getCurrentUser(),
      ]);
      
      set({
        isAuthenticated,
        user,
        isLoading: false,
      });
    } catch (error) {
      console.error('Check auth error:', error);
      set({
        isAuthenticated: false,
        user: null,
        isLoading: false,
      });
    }
  },

  updateUser: async (updates) => {
    try {
      set({ isLoading: true, error: null });
      
      const updatedUser = await authService.updateProfile(updates);
      
      set({
        user: updatedUser,
        isLoading: false,
        error: null,
      });
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.message || 'Profil güncellenemedi',
      });
      throw error;
    }
  },

  setError: (error) => {
    set({ error });
  },

  clearError: () => {
    set({ error: null });
  },
}));
