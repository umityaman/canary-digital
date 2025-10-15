import { create } from 'zustand'
import api from '../services/api'

export interface Order {
  id: number
  orderNumber: string
  customerId: number
  customer?: {
    id: number
    name: string
    email: string
  }
  startDate: string
  endDate: string
  totalAmount: number
  status: 'PENDING' | 'CONFIRMED' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED'
  notes?: string
  createdAt: string
  updatedAt: string
  items?: OrderItem[]
}

export interface OrderItem {
  id: number
  orderId: number
  equipmentId: number
  equipment?: {
    id: number
    name: string
    model: string
    qrCode: string
  }
  quantity: number
  pricePerDay: number
  totalPrice: number
}

interface OrderStore {
  orders: Order[]
  loading: boolean
  error: string | null
  fetchOrders: () => Promise<void>
  createOrder: (orderData: any) => Promise<Order>
  updateOrder: (id: number, orderData: any) => Promise<Order>
  deleteOrder: (id: number) => Promise<void>
}

export const useOrderStore = create<OrderStore>((set, _get) => ({
  orders: [],
  loading: false,
  error: null,

  fetchOrders: async () => {
    set({ loading: true, error: null })
    try {
      const response = await api.get('/orders')
      set({ orders: response.data, loading: false })
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || 'Siparişler yüklenemedi',
        loading: false 
      })
    }
  },

  createOrder: async (orderData) => {
    set({ loading: true, error: null })
    try {
      const response = await api.post('/orders', orderData)
      set((state) => ({
        orders: [...state.orders, response.data],
        loading: false
      }))
      return response.data
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || 'Sipariş oluşturulamadı',
        loading: false 
      })
      throw error
    }
  },

  updateOrder: async (id, orderData) => {
    set({ loading: true, error: null })
    try {
      const response = await api.put(`/orders/${id}`, orderData)
      set((state) => ({
        orders: state.orders.map((order) =>
          order.id === id ? response.data : order
        ),
        loading: false
      }))
      return response.data
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || 'Sipariş güncellenemedi',
        loading: false 
      })
      throw error
    }
  },

  deleteOrder: async (id) => {
    set({ loading: true, error: null })
    try {
      await api.delete(`/orders/${id}`)
      set((state) => ({
        orders: state.orders.filter((order) => order.id !== id),
        loading: false
      }))
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || 'Sipariş silinemedi',
        loading: false 
      })
      throw error
    }
  },
}))
