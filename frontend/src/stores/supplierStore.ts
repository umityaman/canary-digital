import { create } from 'zustand'
import api from '../services/api'

export interface Supplier {
  id: number
  name: string
  contactPerson?: string
  email?: string
  phone?: string
  address?: string
  website?: string
  taxNumber?: string
  category?: string
  rating?: number
  notes?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

interface SupplierState {
  suppliers: Supplier[]
  isLoading: boolean
  error: string | null
  fetchSuppliers: () => Promise<void>
  createSupplier: (data: Partial<Supplier>) => Promise<void>
  updateSupplier: (id: number, data: Partial<Supplier>) => Promise<void>
  deleteSupplier: (id: number) => Promise<void>
  toggleSupplierActive: (id: number) => Promise<void>
}

export const useSupplierStore = create<SupplierState>((set, get) => ({
  suppliers: [],
  isLoading: false,
  error: null,

  fetchSuppliers: async () => {
    set({ isLoading: true, error: null })
    try {
      const response = await api.get('/suppliers')
      set({ suppliers: response.data, isLoading: false })
    } catch (error: any) {
      set({ error: error.message, isLoading: false })
      console.error('Error fetching suppliers:', error)
    }
  },

  createSupplier: async (data) => {
    set({ isLoading: true, error: null })
    try {
      const response = await api.post('/suppliers', data)
      set((state) => ({
        suppliers: [...state.suppliers, response.data],
        isLoading: false
      }))
    } catch (error: any) {
      set({ error: error.message, isLoading: false })
      console.error('Error creating supplier:', error)
      throw error
    }
  },

  updateSupplier: async (id, data) => {
    set({ isLoading: true, error: null })
    try {
      const response = await api.put(`/suppliers/${id}`, data)
      set((state) => ({
        suppliers: state.suppliers.map((s) =>
          s.id === id ? response.data : s
        ),
        isLoading: false
      }))
    } catch (error: any) {
      set({ error: error.message, isLoading: false })
      console.error('Error updating supplier:', error)
      throw error
    }
  },

  deleteSupplier: async (id) => {
    set({ isLoading: true, error: null })
    try {
      await api.delete(`/suppliers/${id}`)
      set((state) => ({
        suppliers: state.suppliers.filter((s) => s.id !== id),
        isLoading: false
      }))
    } catch (error: any) {
      set({ error: error.message, isLoading: false })
      console.error('Error deleting supplier:', error)
      throw error
    }
  },

  toggleSupplierActive: async (id) => {
    const supplier = get().suppliers.find((s) => s.id === id)
    if (!supplier) return

    try {
      const response = await api.put(`/suppliers/${id}`, {
        isActive: !supplier.isActive
      })
      set((state) => ({
        suppliers: state.suppliers.map((s) =>
          s.id === id ? response.data : s
        )
      }))
    } catch (error: any) {
      console.error('Error toggling supplier status:', error)
      throw error
    }
  }
}))
