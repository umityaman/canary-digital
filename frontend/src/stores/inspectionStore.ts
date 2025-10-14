import { create } from 'zustand';
import inspectionApi from '../services/inspectionApi';
import type {
  Inspection,
  InspectionFilters,
  CreateInspectionDto,
  UpdateInspectionDto,
  InspectionPhoto,
  DamageReport,
  DamageReportDto
} from '../types/inspection';

interface InspectionStore {
  inspections: Inspection[];
  selectedInspection: Inspection | null;
  loading: boolean;
  error: string | null;

  // Actions
  fetchInspections: (filters?: InspectionFilters) => Promise<void>;
  getInspection: (id: number) => Promise<void>;
  getInspectionsByOrder: (orderId: number) => Promise<void>;
  createInspection: (data: CreateInspectionDto) => Promise<Inspection>;
  updateInspection: (id: number, data: UpdateInspectionDto) => Promise<Inspection>;
  deleteInspection: (id: number) => Promise<void>;
  
  // Photo actions
  uploadPhoto: (inspectionId: number, photoData: any) => Promise<InspectionPhoto>;
  deletePhoto: (inspectionId: number, photoId: number) => Promise<void>;
  
  // Damage report actions
  addDamageReport: (inspectionId: number, data: DamageReportDto) => Promise<DamageReport>;
  updateDamageReport: (inspectionId: number, damageId: number, data: Partial<DamageReportDto>) => Promise<DamageReport>;
  deleteDamageReport: (inspectionId: number, damageId: number) => Promise<void>;
  
  // Signature actions
  saveSignature: (inspectionId: number, signatureData: string, type: 'customer' | 'inspector') => Promise<void>;
  
  // State management
  setSelectedInspection: (inspection: Inspection | null) => void;
  clearError: () => void;
}

export const useInspectionStore = create<InspectionStore>((set) => ({
  inspections: [],
  selectedInspection: null,
  loading: false,
  error: null,

  fetchInspections: async (filters?: InspectionFilters) => {
    set({ loading: true, error: null });
    try {
      const inspections = await inspectionApi.getInspections(filters);
      set({ inspections, loading: false });
    } catch (error: any) {
      set({ 
        error: error.response?.data?.error || 'Kontroller yüklenirken hata oluştu',
        loading: false 
      });
    }
  },

  getInspection: async (id: number) => {
    set({ loading: true, error: null });
    try {
      const inspection = await inspectionApi.getInspection(id);
      set({ selectedInspection: inspection, loading: false });
    } catch (error: any) {
      set({ 
        error: error.response?.data?.error || 'Kontrol yüklenirken hata oluştu',
        loading: false 
      });
    }
  },

  getInspectionsByOrder: async (orderId: number) => {
    set({ loading: true, error: null });
    try {
      const inspections = await inspectionApi.getInspectionsByOrder(orderId);
      set({ inspections, loading: false });
    } catch (error: any) {
      set({ 
        error: error.response?.data?.error || 'Kontroller yüklenirken hata oluştu',
        loading: false 
      });
    }
  },

  createInspection: async (data: CreateInspectionDto) => {
    set({ loading: true, error: null });
    try {
      const inspection = await inspectionApi.createInspection(data);
      set(state => ({
        inspections: [inspection, ...state.inspections],
        selectedInspection: inspection,
        loading: false
      }));
      return inspection;
    } catch (error: any) {
      set({ 
        error: error.response?.data?.error || 'Kontrol oluşturulurken hata oluştu',
        loading: false 
      });
      throw error;
    }
  },

  updateInspection: async (id: number, data: UpdateInspectionDto) => {
    set({ loading: true, error: null });
    try {
      const inspection = await inspectionApi.updateInspection(id, data);
      set(state => ({
        inspections: state.inspections.map(i => i.id === id ? inspection : i),
        selectedInspection: state.selectedInspection?.id === id ? inspection : state.selectedInspection,
        loading: false
      }));
      return inspection;
    } catch (error: any) {
      set({ 
        error: error.response?.data?.error || 'Kontrol güncellenirken hata oluştu',
        loading: false 
      });
      throw error;
    }
  },

  deleteInspection: async (id: number) => {
    set({ loading: true, error: null });
    try {
      await inspectionApi.deleteInspection(id);
      set(state => ({
        inspections: state.inspections.filter(i => i.id !== id),
        selectedInspection: state.selectedInspection?.id === id ? null : state.selectedInspection,
        loading: false
      }));
    } catch (error: any) {
      set({ 
        error: error.response?.data?.error || 'Kontrol silinirken hata oluştu',
        loading: false 
      });
      throw error;
    }
  },

  uploadPhoto: async (inspectionId: number, photoData: any) => {
    try {
      const photo = await inspectionApi.uploadPhoto(inspectionId, photoData);
      
      // Seçili inspection güncelle
      set(state => {
        if (state.selectedInspection?.id === inspectionId) {
          return {
            selectedInspection: {
              ...state.selectedInspection,
              photos: [...(state.selectedInspection.photos || []), photo]
            }
          };
        }
        return state;
      });
      
      return photo;
    } catch (error: any) {
      set({ error: error.response?.data?.error || 'Fotoğraf yüklenirken hata oluştu' });
      throw error;
    }
  },

  deletePhoto: async (inspectionId: number, photoId: number) => {
    try {
      await inspectionApi.deletePhoto(inspectionId, photoId);
      
      // Seçili inspection güncelle
      set(state => {
        if (state.selectedInspection?.id === inspectionId) {
          return {
            selectedInspection: {
              ...state.selectedInspection,
              photos: state.selectedInspection.photos?.filter(p => p.id !== photoId)
            }
          };
        }
        return state;
      });
    } catch (error: any) {
      set({ error: error.response?.data?.error || 'Fotoğraf silinirken hata oluştu' });
      throw error;
    }
  },

  addDamageReport: async (inspectionId: number, data: DamageReportDto) => {
    try {
      const damage = await inspectionApi.addDamageReport(inspectionId, data);
      
      // Seçili inspection güncelle
      set(state => {
        if (state.selectedInspection?.id === inspectionId) {
          return {
            selectedInspection: {
              ...state.selectedInspection,
              damageReports: [...(state.selectedInspection.damageReports || []), damage],
              status: 'DAMAGE_FOUND'
            }
          };
        }
        return state;
      });
      
      return damage;
    } catch (error: any) {
      set({ error: error.response?.data?.error || 'Hasar raporu eklenirken hata oluştu' });
      throw error;
    }
  },

  updateDamageReport: async (inspectionId: number, damageId: number, data: Partial<DamageReportDto>) => {
    try {
      const damage = await inspectionApi.updateDamageReport(inspectionId, damageId, data);
      
      // Seçili inspection güncelle
      set(state => {
        if (state.selectedInspection?.id === inspectionId) {
          return {
            selectedInspection: {
              ...state.selectedInspection,
              damageReports: state.selectedInspection.damageReports?.map(d => 
                d.id === damageId ? damage : d
              )
            }
          };
        }
        return state;
      });
      
      return damage;
    } catch (error: any) {
      set({ error: error.response?.data?.error || 'Hasar raporu güncellenirken hata oluştu' });
      throw error;
    }
  },

  deleteDamageReport: async (inspectionId: number, damageId: number) => {
    try {
      await inspectionApi.deleteDamageReport(inspectionId, damageId);
      
      // Seçili inspection güncelle
      set(state => {
        if (state.selectedInspection?.id === inspectionId) {
          return {
            selectedInspection: {
              ...state.selectedInspection,
              damageReports: state.selectedInspection.damageReports?.filter(d => d.id !== damageId)
            }
          };
        }
        return state;
      });
    } catch (error: any) {
      set({ error: error.response?.data?.error || 'Hasar raporu silinirken hata oluştu' });
      throw error;
    }
  },

  saveSignature: async (inspectionId: number, signatureData: string, type: 'customer' | 'inspector') => {
    try {
      const inspection = await inspectionApi.saveSignature(inspectionId, signatureData, type);
      
      set(state => ({
        selectedInspection: state.selectedInspection?.id === inspectionId ? inspection : state.selectedInspection
      }));
    } catch (error: any) {
      set({ error: error.response?.data?.error || 'İmza kaydedilirken hata oluştu' });
      throw error;
    }
  },

  setSelectedInspection: (inspection: Inspection | null) => {
    set({ selectedInspection: inspection });
  },

  clearError: () => {
    set({ error: null });
  }
}));
