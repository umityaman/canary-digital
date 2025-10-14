import { create } from 'zustand'
import { authAPI } from '../services/api'

interface User {
  id: number
  email: string
  name: string
  firstName?: string
  lastName?: string
  phone?: string
  position?: string
  role: string
  createdAt?: string
  company?: {
    id: number
    name: string
    email?: string
    address?: string
  }
}

interface AuthState {
  user: User | null
  token: string | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (credentials: { email: string; password: string }) => Promise<void>
  register: (data: { email: string; password: string; name: string; companyName: string }) => Promise<void>
  logout: () => void
  loadUserFromStorage: () => void
  setUser: (user: User) => void
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  isLoading: false,
  isAuthenticated: false,

  login: async (credentials) => {
    set({ isLoading: true })
    try {
      const response = await authAPI.login(credentials)
      const { user, token } = response.data

      // localStorage'a kaydet
      localStorage.setItem('auth_token', token)
      localStorage.setItem('user_data', JSON.stringify(user))

      set({ 
        user, 
        token, 
        isAuthenticated: true, 
        isLoading: false 
      })
    } catch (error: any) {
      set({ isLoading: false })
      throw new Error(error.response?.data?.error || 'Login failed')
    }
  },

  register: async (data) => {
    set({ isLoading: true })
    try {
      const response = await authAPI.register(data)
      const { user, token } = response.data

      // localStorage'a kaydet
      localStorage.setItem('auth_token', token)
      localStorage.setItem('user_data', JSON.stringify(user))

      set({ 
        user, 
        token, 
        isAuthenticated: true, 
        isLoading: false 
      })
    } catch (error: any) {
      set({ isLoading: false })
      throw new Error(error.response?.data?.error || 'Registration failed')
    }
  },

  logout: () => {
    localStorage.removeItem('auth_token')
    localStorage.removeItem('user_data')
    set({ 
      user: null, 
      token: null, 
      isAuthenticated: false 
    })
  },

  loadUserFromStorage: () => {
    const token = localStorage.getItem('auth_token')
    const userData = localStorage.getItem('user_data')

    if (token && userData) {
      try {
        const user = JSON.parse(userData)
        set({ 
          user, 
          token, 
          isAuthenticated: true 
        })
      } catch (error) {
        // Geçersiz data varsa temizle
        localStorage.removeItem('auth_token')
        localStorage.removeItem('user_data')
      }
    }
  },

  setUser: (user) => {
    localStorage.setItem('user_data', JSON.stringify(user))
    set({ user })
  }
}))

// Uygulama başlangıcında kullanıcıyı yükle
if (typeof window !== 'undefined') {
  useAuthStore.getState().loadUserFromStorage()
}