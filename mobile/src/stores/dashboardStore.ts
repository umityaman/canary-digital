import { create } from 'zustand';
import api from '../services/api';
import type { DashboardStats } from '../types';

interface DashboardState {
  stats: DashboardStats | null;
  isLoading: boolean;
  error: string | null;
  lastUpdated: number | null;
  
  // Actions
  fetchDashboardStats: () => Promise<void>;
  refreshStats: () => Promise<void>;
}

export const useDashboardStore = create<DashboardState>((set, get) => ({
  stats: null,
  isLoading: false,
  error: null,
  lastUpdated: null,

  fetchDashboardStats: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get('/dashboard/stats');
      
      if (response.data.success) {
        set({ 
          stats: response.data.data,
          isLoading: false,
          lastUpdated: Date.now(),
        });
      } else {
        set({ error: response.data.message || 'İstatistikler yüklenemedi', isLoading: false });
      }
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || 'Bir hata oluştu', 
        isLoading: false 
      });
    }
  },

  refreshStats: async () => {
    await get().fetchDashboardStats();
  },
}));
