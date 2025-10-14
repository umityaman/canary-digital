import { create } from 'zustand';
import api from '../services/api';
import type { Reservation, ReservationFilters, CreateReservationForm } from '../types';

interface ReservationState {
  reservations: Reservation[];
  selectedReservation: Reservation | null;
  isLoading: boolean;
  error: string | null;
  filters: ReservationFilters;
  
  // Actions
  fetchReservations: () => Promise<void>;
  fetchReservationById: (id: number) => Promise<Reservation | null>;
  createReservation: (data: CreateReservationForm) => Promise<Reservation | null>;
  updateReservation: (id: number, data: Partial<Reservation>) => Promise<Reservation | null>;
  cancelReservation: (id: number) => Promise<boolean>;
  setFilters: (filters: ReservationFilters) => void;
  clearFilters: () => void;
  setSelectedReservation: (reservation: Reservation | null) => void;
}

export const useReservationStore = create<ReservationState>((set, get) => ({
  reservations: [],
  selectedReservation: null,
  isLoading: false,
  error: null,
  filters: {},

  fetchReservations: async () => {
    set({ isLoading: true, error: null });
    try {
      const { filters } = get();
      const params = new URLSearchParams();
      
      if (filters.search) params.append('search', filters.search);
      if (filters.status) params.append('status', filters.status);
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);

      const response = await api.get(`/reservations?${params.toString()}`);
      
      if (response.data.success) {
        set({ reservations: response.data.data, isLoading: false });
      } else {
        set({ error: response.data.message || 'Rezervasyonlar yüklenemedi', isLoading: false });
      }
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || 'Bir hata oluştu', 
        isLoading: false 
      });
    }
  },

  fetchReservationById: async (id: number) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get(`/reservations/${id}`);
      
      if (response.data.success) {
        const reservation = response.data.data;
        set({ selectedReservation: reservation, isLoading: false });
        return reservation;
      } else {
        set({ error: response.data.message || 'Rezervasyon bulunamadı', isLoading: false });
        return null;
      }
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || 'Bir hata oluştu', 
        isLoading: false 
      });
      return null;
    }
  },

  createReservation: async (data: CreateReservationForm) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post('/reservations', data);
      
      if (response.data.success) {
        const newReservation = response.data.data;
        set(state => ({ 
          reservations: [newReservation, ...state.reservations],
          isLoading: false 
        }));
        return newReservation;
      } else {
        set({ error: response.data.message || 'Rezervasyon oluşturulamadı', isLoading: false });
        return null;
      }
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || 'Bir hata oluştu', 
        isLoading: false 
      });
      return null;
    }
  },

  updateReservation: async (id: number, data: Partial<Reservation>) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.put(`/reservations/${id}`, data);
      
      if (response.data.success) {
        const updatedReservation = response.data.data;
        set(state => ({ 
          reservations: state.reservations.map(r => 
            r.id === id ? updatedReservation : r
          ),
          selectedReservation: state.selectedReservation?.id === id 
            ? updatedReservation 
            : state.selectedReservation,
          isLoading: false 
        }));
        return updatedReservation;
      } else {
        set({ error: response.data.message || 'Rezervasyon güncellenemedi', isLoading: false });
        return null;
      }
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || 'Bir hata oluştu', 
        isLoading: false 
      });
      return null;
    }
  },

  cancelReservation: async (id: number) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.put(`/reservations/${id}/cancel`);
      
      if (response.data.success) {
        const cancelledReservation = response.data.data;
        set(state => ({ 
          reservations: state.reservations.map(r => 
            r.id === id ? cancelledReservation : r
          ),
          selectedReservation: state.selectedReservation?.id === id 
            ? cancelledReservation 
            : state.selectedReservation,
          isLoading: false 
        }));
        return true;
      } else {
        set({ error: response.data.message || 'Rezervasyon iptal edilemedi', isLoading: false });
        return false;
      }
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || 'Bir hata oluştu', 
        isLoading: false 
      });
      return false;
    }
  },

  setFilters: (filters: ReservationFilters) => {
    set({ filters });
  },

  clearFilters: () => {
    set({ filters: {} });
  },

  setSelectedReservation: (reservation: Reservation | null) => {
    set({ selectedReservation: reservation });
  },
}));
