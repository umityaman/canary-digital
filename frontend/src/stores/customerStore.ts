import { create } from 'zustand';
import api from '../services/api';

interface Customer {
  id: number;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  company?: string;
  taxNumber?: string;
  createdAt: string;
  updatedAt: string;
  orders?: any[];
  booqableId?: string;
}

interface CustomerState {
  customers: Customer[];
  loading: boolean;
  error: string | null;
  fetchCustomers: (search?: string) => Promise<void>;
  getCustomer: (id: number) => Promise<Customer | null>;
  createCustomer: (data: Partial<Customer>) => Promise<Customer>;
  updateCustomer: (id: number, data: Partial<Customer>) => Promise<Customer>;
  deleteCustomer: (id: number) => Promise<void>;
}

export const useCustomerStore = create<CustomerState>((set, get) => ({
  customers: [],
  loading: false,
  error: null,

  fetchCustomers: async (search?: string) => {
    set({ loading: true, error: null });
    try {
      const params = search ? { search } : {};
      const response = await api.get('/customers', { params });
      set({ customers: response.data, loading: false });
    } catch (error: any) {
      set({ 
        error: error.response?.data?.error || 'Failed to fetch customers', 
        loading: false 
      });
    }
  },

  getCustomer: async (id: number) => {
    set({ loading: true, error: null });
    try {
      const response = await api.get(`/customers/${id}`);
      set({ loading: false });
      return response.data;
    } catch (error: any) {
      set({ 
        error: error.response?.data?.error || 'Failed to fetch customer', 
        loading: false 
      });
      return null;
    }
  },

  createCustomer: async (data: Partial<Customer>) => {
    set({ loading: true, error: null });
    try {
      const response = await api.post('/customers', data);
      const newCustomer = response.data;
      set(state => ({ 
        customers: [newCustomer, ...state.customers],
        loading: false 
      }));
      return newCustomer;
    } catch (error: any) {
      set({ 
        error: error.response?.data?.error || 'Failed to create customer', 
        loading: false 
      });
      throw error;
    }
  },

  updateCustomer: async (id: number, data: Partial<Customer>) => {
    set({ loading: true, error: null });
    try {
      const response = await api.put(`/customers/${id}`, data);
      const updatedCustomer = response.data;
      set(state => ({
        customers: state.customers.map(c => 
          c.id === id ? updatedCustomer : c
        ),
        loading: false
      }));
      return updatedCustomer;
    } catch (error: any) {
      set({ 
        error: error.response?.data?.error || 'Failed to update customer', 
        loading: false 
      });
      throw error;
    }
  },

  deleteCustomer: async (id: number) => {
    set({ loading: true, error: null });
    try {
      await api.delete(`/customers/${id}`);
      set(state => ({
        customers: state.customers.filter(c => c.id !== id),
        loading: false
      }));
    } catch (error: any) {
      set({ 
        error: error.response?.data?.error || 'Failed to delete customer', 
        loading: false 
      });
      throw error;
    }
  }
}));
