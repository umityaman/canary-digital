import { useEffect, useCallback } from 'react';
import { useNotificationStore } from '../components/NotificationSystem';

interface NotificationAPI {
  id: number;
  userId?: number;
  companyId?: number;
  type: string;
  title: string;
  message: string;
  category?: string;
  priority: string;
  status: string;
  readAt?: string;
  createdAt: string;
  actionUrl?: string;
  actionLabel?: string;
}

interface NotificationPreferences {
  id: number;
  userId: number;
  emailEnabled: boolean;
  smsEnabled: boolean;
  pushEnabled: boolean;
  inAppEnabled: boolean;
  reservationEmail: boolean;
  reservationSms: boolean;
  reservationPush: boolean;
  orderEmail: boolean;
  orderSms: boolean;
  orderPush: boolean;
  equipmentEmail: boolean;
  equipmentSms: boolean;
  equipmentPush: boolean;
  reminderEmail: boolean;
  reminderSms: boolean;
  reminderPush: boolean;
  alertEmail: boolean;
  alertSms: boolean;
  alertPush: boolean;
}

export const useNotificationAPI = () => {
  const { addNotification, markAsRead, markAllAsRead } = useNotificationStore();

  const getAuthHeaders = () => {
    const token = localStorage.getItem('authToken');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    };
  };

  // Fetch user notifications
  const fetchNotifications = useCallback(async (limit = 50, offset = 0) => {
    try {
      const response = await fetch(
        `/api/notifications?limit=${limit}&offset=${offset}`,
        {
          headers: getAuthHeaders(),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch notifications');
      }

      const data = await response.json();
      
      if (data.success) {
        // Convert API format to store format
        const notifications = data.data.map((notif: NotificationAPI) => ({
          id: notif.id,
          title: notif.title,
          message: notif.message,
          type: mapNotificationType(notif.type, notif.category),
          read: !!notif.readAt,
          createdAt: notif.createdAt,
          data: {
            priority: notif.priority,
            category: notif.category,
            actionUrl: notif.actionUrl,
            actionLabel: notif.actionLabel,
          },
        }));

        return notifications;
      }
      
      throw new Error(data.message || 'Failed to fetch notifications');
    } catch (error) {
      console.error('Error fetching notifications:', error);
      throw error;
    }
  }, []);

  // Get unread count
  const fetchUnreadCount = useCallback(async () => {
    try {
      const response = await fetch('/api/notifications/unread-count', {
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch unread count');
      }

      const data = await response.json();
      
      if (data.success) {
        return data.data.count;
      }
      
      throw new Error(data.message || 'Failed to fetch unread count');
    } catch (error) {
      console.error('Error fetching unread count:', error);
      return 0;
    }
  }, []);

  // Mark notification as read
  const markNotificationAsRead = useCallback(async (id: number) => {
    try {
      const response = await fetch(`/api/notifications/${id}/read`, {
        method: 'PUT',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to mark notification as read');
      }

      const data = await response.json();
      
      if (data.success) {
        markAsRead(id);
        return true;
      }
      
      throw new Error(data.message || 'Failed to mark notification as read');
    } catch (error) {
      console.error('Error marking notification as read:', error);
      return false;
    }
  }, [markAsRead]);

  // Mark multiple notifications as read
  const markMultipleAsRead = useCallback(async (ids: number[]) => {
    try {
      const response = await fetch('/api/notifications/mark-read', {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ ids }),
      });

      if (!response.ok) {
        throw new Error('Failed to mark notifications as read');
      }

      const data = await response.json();
      
      if (data.success) {
        ids.forEach(id => markAsRead(id));
        return true;
      }
      
      throw new Error(data.message || 'Failed to mark notifications as read');
    } catch (error) {
      console.error('Error marking notifications as read:', error);
      return false;
    }
  }, [markAsRead]);

  // Delete notification
  const deleteNotification = useCallback(async (id: number) => {
    try {
      const response = await fetch(`/api/notifications/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to delete notification');
      }

      const data = await response.json();
      
      if (data.success) {
        useNotificationStore.getState().removeNotification(id);
        return true;
      }
      
      throw new Error(data.message || 'Failed to delete notification');
    } catch (error) {
      console.error('Error deleting notification:', error);
      return false;
    }
  }, []);

  // Get notification preferences
  const fetchNotificationPreferences = useCallback(async () => {
    try {
      const response = await fetch('/api/notifications/preferences', {
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch notification preferences');
      }

      const data = await response.json();
      
      if (data.success) {
        return data.data as NotificationPreferences;
      }
      
      throw new Error(data.message || 'Failed to fetch notification preferences');
    } catch (error) {
      console.error('Error fetching notification preferences:', error);
      throw error;
    }
  }, []);

  // Update notification preferences
  const updateNotificationPreferences = useCallback(async (preferences: Partial<NotificationPreferences>) => {
    try {
      const response = await fetch('/api/notifications/preferences', {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(preferences),
      });

      if (!response.ok) {
        throw new Error('Failed to update notification preferences');
      }

      const data = await response.json();
      
      if (data.success) {
        return data.data as NotificationPreferences;
      }
      
      throw new Error(data.message || 'Failed to update notification preferences');
    } catch (error) {
      console.error('Error updating notification preferences:', error);
      throw error;
    }
  }, []);

  // Load initial notifications
  const initializeNotifications = useCallback(async () => {
    try {
      const [notifications, unreadCount] = await Promise.all([
        fetchNotifications(20, 0), // Load recent 20 notifications
        fetchUnreadCount(),
      ]);

      // Add notifications to store
      notifications.forEach(notification => {
        addNotification(notification);
      });

      // Update unread count
      const store = useNotificationStore.getState();
      store.unreadCount = unreadCount;

    } catch (error) {
      console.error('Error initializing notifications:', error);
    }
  }, [fetchNotifications, fetchUnreadCount, addNotification]);

  return {
    fetchNotifications,
    fetchUnreadCount,
    markNotificationAsRead,
    markMultipleAsRead,
    deleteNotification,
    fetchNotificationPreferences,
    updateNotificationPreferences,
    initializeNotifications,
  };
};

// Helper function to map API notification types to UI types
function mapNotificationType(apiType: string, category?: string): 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR' {
  // Map based on category first
  if (category) {
    switch (category.toLowerCase()) {
      case 'alert':
        return 'ERROR';
      case 'reminder':
        return 'WARNING';
      case 'order':
      case 'reservation':
        return 'SUCCESS';
      case 'equipment':
        return 'INFO';
      default:
        break;
    }
  }

  // Map based on type
  switch (apiType.toLowerCase()) {
    case 'email':
    case 'sms':
      return 'INFO';
    case 'push':
      return 'SUCCESS';
    case 'in_app':
      return 'INFO';
    default:
      return 'INFO';
  }
}

// Hook for real-time notifications (will be enhanced with WebSocket)
export const useRealTimeNotifications = () => {
  const { addNotification } = useNotificationStore();
  const { fetchUnreadCount } = useNotificationAPI();

  useEffect(() => {
    // Polling fallback (will be replaced with WebSocket)
    const interval = setInterval(async () => {
      try {
        await fetchUnreadCount();
      } catch (error) {
        console.error('Error in real-time notification polling:', error);
      }
    }, 30000); // Poll every 30 seconds

    return () => clearInterval(interval);
  }, [fetchUnreadCount]);

  // WebSocket integration will be added here
  useEffect(() => {
    // TODO: WebSocket connection for real-time notifications
    // const socket = io('/notifications');
    // socket.on('newNotification', (notification) => {
    //   addNotification(notification);
    // });
    // return () => socket.disconnect();
  }, [addNotification]);
};

export default useNotificationAPI;