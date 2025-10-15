import { create } from 'zustand'
import api from '../services/api'

interface Equipment {
  id: string
  name: string
  brand: string
  model: string
  category: string
  serialNumber?: string
  description?: string
  dailyPrice?: number
  status: 'AVAILABLE' | 'RENTED' | 'MAINTENANCE' | 'RESERVED' | 'LOST' | 'BROKEN'
  equipmentType?: 'RENTAL' | 'SALE' | 'SERVICE'
  inventoryId?: string
  booqableId?: string
}

interface EquipmentStore {
  equipment: Equipment[]
  loading: boolean
  error: string | null
  
  // Actions
  fetchEquipment: () => Promise<void>
  createEquipment: (data: Omit<Equipment, 'id'>) => Promise<void>
  updateEquipment: (id: string, data: Omit<Equipment, 'id'>) => Promise<void>
  deleteEquipment: (id: string) => Promise<void>
  clearError: () => void
}

export const useEquipmentStore = create<EquipmentStore>((set, _get) => ({
  equipment: [],
  loading: false,
  error: null,

  fetchEquipment: async () => {
    set({ loading: true, error: null })
    try {
      const response = await api.get('/equipment')
      set({ equipment: response.data, loading: false })
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || 'Ekipmanlar yüklenirken hata oluştu',
        loading: false 
      })
    }
  },

  createEquipment: async (data) => {
    set({ loading: true, error: null })
    try {
      const response = await api.post('/equipment', data)
      set(state => ({ 
        equipment: [...state.equipment, response.data],
        loading: false 
      }))
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || 'Ekipman eklenirken hata oluştu',
        loading: false 
      })
      throw error // Re-throw to handle in component
    }
  },

  updateEquipment: async (id, data) => {
    set({ loading: true, error: null })
    try {
      const response = await api.put(`/equipment/${id}`, data)
      set(state => ({
        equipment: state.equipment.map(item => 
          item.id === id ? response.data : item
        ),
        loading: false
      }))
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || 'Ekipman güncellenirken hata oluştu',
        loading: false 
      })
      throw error // Re-throw to handle in component
    }
  },

  deleteEquipment: async (id) => {
    set({ loading: true, error: null })
    try {
      await api.delete(`/equipment/${id}`)
      set(state => ({
        equipment: state.equipment.filter(item => item.id !== id),
        loading: false
      }))
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || 'Ekipman silinirken hata oluştu',
        loading: false 
      })
      throw error // Re-throw to handle in component
    }
  },

  clearError: () => set({ error: null })
}))