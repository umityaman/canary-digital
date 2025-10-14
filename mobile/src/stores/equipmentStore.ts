import { create } from 'zustand';
import api, { handleApiResponse, handleApiError } from '../services/api';
import { Equipment, EquipmentFilters, ApiResponse } from '../types';
import { API_ENDPOINTS } from '../constants/config';

interface EquipmentState {
  equipment: Equipment[];
  selectedEquipment: Equipment | null;
  isLoading: boolean;
  error: string | null;
  filters: EquipmentFilters;
  
  // Actions
  fetchEquipment: () => Promise<void>;
  fetchEquipmentById: (id: number) => Promise<void>;
  fetchEquipmentByQR: (code: string) => Promise<void>;
  setSelectedEquipment: (equipment: Equipment | null) => void;
  setFilters: (filters: Partial<EquipmentFilters>) => void;
  clearFilters: () => void;
  setError: (error: string | null) => void;
}

export const useEquipmentStore = create<EquipmentState>((set, get) => ({
  equipment: [],
  selectedEquipment: null,
  isLoading: false,
  error: null,
  filters: {},

  fetchEquipment: async () => {
    try {
      set({ isLoading: true, error: null });
      
      const { filters } = get();
      
      const response = await api.get<ApiResponse<Equipment[]>>(
        API_ENDPOINTS.EQUIPMENT,
        { params: filters }
      );
      
      const equipment = handleApiResponse<Equipment[]>(response);
      
      set({
        equipment,
        isLoading: false,
        error: null,
      });
    } catch (error: any) {
      set({
        equipment: [],
        isLoading: false,
        error: handleApiError(error),
      });
    }
  },

  fetchEquipmentById: async (id) => {
    try {
      set({ isLoading: true, error: null });
      
      const response = await api.get<ApiResponse<Equipment>>(
        API_ENDPOINTS.EQUIPMENT_BY_ID(id)
      );
      
      const equipment = handleApiResponse<Equipment>(response);
      
      set({
        selectedEquipment: equipment,
        isLoading: false,
        error: null,
      });
    } catch (error: any) {
      set({
        selectedEquipment: null,
        isLoading: false,
        error: handleApiError(error),
      });
    }
  },

  fetchEquipmentByQR: async (code) => {
    try {
      set({ isLoading: true, error: null });
      
      const response = await api.get<ApiResponse<Equipment>>(
        API_ENDPOINTS.EQUIPMENT_QR(code)
      );
      
      const equipment = handleApiResponse<Equipment>(response);
      
      set({
        selectedEquipment: equipment,
        isLoading: false,
        error: null,
      });
    } catch (error: any) {
      set({
        selectedEquipment: null,
        isLoading: false,
        error: handleApiError(error),
      });
    }
  },

  setSelectedEquipment: (equipment) => {
    set({ selectedEquipment: equipment });
  },

  setFilters: (newFilters) => {
    const { filters } = get();
    set({ filters: { ...filters, ...newFilters } });
  },

  clearFilters: () => {
    set({ filters: {} });
  },

  setError: (error) => {
    set({ error });
  },
}));
