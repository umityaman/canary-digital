import { create } from 'zustand';
import api from '../services/api';
import type { Notification } from '../types';

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchNotifications: () => Promise<void>;
  markAsRead: (id: number) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: number) => Promise<void>;
  clearAllNotifications: () => Promise<void>;
  addNotification: (notification: Notification) => void;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  error: null,

  fetchNotifications: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get('/notifications');
      
      if (response.data.success) {
        const notifications = response.data.data;
        const unreadCount = notifications.filter((n: Notification) => !n.read).length;
        
        set({ 
          notifications, 
          unreadCount,
          isLoading: false 
        });
      } else {
        set({ error: response.data.message || 'Bildirimler yüklenemedi', isLoading: false });
      }
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || 'Bir hata oluştu', 
        isLoading: false 
      });
    }
  },

  markAsRead: async (id: number) => {
    try {
      const response = await api.put(`/notifications/${id}/read`);
      
      if (response.data.success) {
        set(state => ({
          notifications: state.notifications.map(n =>
            n.id === id ? { ...n, read: true } : n
          ),
          unreadCount: Math.max(0, state.unreadCount - 1),
        }));
      }
    } catch (error: any) {
      console.error('Error marking notification as read:', error);
    }
  },

  markAllAsRead: async () => {
    try {
      const response = await api.put('/notifications/read-all');
      
      if (response.data.success) {
        set(state => ({
          notifications: state.notifications.map(n => ({ ...n, read: true })),
          unreadCount: 0,
        }));
      }
    } catch (error: any) {
      console.error('Error marking all notifications as read:', error);
    }
  },

  deleteNotification: async (id: number) => {
    try {
      const response = await api.delete(`/notifications/${id}`);
      
      if (response.data.success) {
        set(state => {
          const notification = state.notifications.find(n => n.id === id);
          const unreadDecrement = notification && !notification.read ? 1 : 0;
          
          return {
            notifications: state.notifications.filter(n => n.id !== id),
            unreadCount: Math.max(0, state.unreadCount - unreadDecrement),
          };
        });
      }
    } catch (error: any) {
      console.error('Error deleting notification:', error);
    }
  },

  clearAllNotifications: async () => {
    try {
      const response = await api.delete('/notifications/clear-all');
      
      if (response.data.success) {
        set({ notifications: [], unreadCount: 0 });
      }
    } catch (error: any) {
      console.error('Error clearing all notifications:', error);
    }
  },

  addNotification: (notification: Notification) => {
    set(state => ({
      notifications: [notification, ...state.notifications],
      unreadCount: !notification.read ? state.unreadCount + 1 : state.unreadCount,
    }));
  },
}));
