import { create } from 'zustand';
import { Bell, X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useNotificationAPI, useRealTimeNotifications } from '../hooks/useNotificationAPI';

export interface Notification {
  id: number;
  title: string;
  message: string;
  type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR';
  read: boolean;
  createdAt: string;
  data?: any;
}

interface NotificationStore {
  notifications: Notification[];
  unreadCount: number;
  isOpen: boolean;
  addNotification: (notification: Notification) => void;
  markAsRead: (id: number) => void;
  markAllAsRead: () => void;
  removeNotification: (id: number) => void;
  clearAll: () => void;
  togglePanel: () => void;
  setOpen: (open: boolean) => void;
}

export const useNotificationStore = create<NotificationStore>((set) => ({
  notifications: [],
  unreadCount: 0,
  isOpen: false,

  addNotification: (notification) =>
    set((state) => ({
      notifications: [notification, ...state.notifications],
      unreadCount: state.unreadCount + 1,
    })),

  markAsRead: (id) =>
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n
      ),
      unreadCount: Math.max(0, state.unreadCount - 1),
    })),

  markAllAsRead: () =>
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, read: true })),
      unreadCount: 0,
    })),

  removeNotification: (id) =>
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
      unreadCount: state.notifications.find((n) => n.id === id)?.read
        ? state.unreadCount
        : Math.max(0, state.unreadCount - 1),
    })),

  clearAll: () =>
    set({
      notifications: [],
      unreadCount: 0,
    }),

  togglePanel: () => set((state) => ({ isOpen: !state.isOpen })),
  
  setOpen: (open) => set({ isOpen: open }),
}));

// Notification Panel Component
export const NotificationPanel = () => {
  const {
    notifications,
    unreadCount,
    isOpen,
    markAsRead,
    markAllAsRead,
    removeNotification,
    togglePanel,
    setOpen,
  } = useNotificationStore();

  const { 
    markNotificationAsRead, 
    deleteNotification, 
    initializeNotifications 
  } = useNotificationAPI();
  
  // Initialize real-time notifications
  useRealTimeNotifications();

  // Load notifications on component mount
  useEffect(() => {
    initializeNotifications();
  }, [initializeNotifications]);

  const handleMarkAsRead = async (id: number) => {
    const success = await markNotificationAsRead(id);
    if (!success) {
      // Fallback to local state update if API fails
      markAsRead(id);
    }
  };

  const handleDelete = async (id: number) => {
    const success = await deleteNotification(id);
    if (!success) {
      // Fallback to local state update if API fails
      removeNotification(id);
    }
  };

  const handleMarkAllAsRead = async () => {
    const unreadIds = notifications.filter(n => !n.read).map(n => n.id);
    if (unreadIds.length > 0) {
      const { markMultipleAsRead } = useNotificationAPI();
      const success = await markMultipleAsRead(unreadIds);
      if (!success) {
        // Fallback to local state update if API fails
        markAllAsRead();
      }
    }
  };

  const getIcon = (type: Notification['type']) => {
    switch (type) {
      case 'SUCCESS':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'ERROR':
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      case 'WARNING':
        return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
      case 'INFO':
        return <Info className="w-5 h-5 text-blue-600" />;
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diff < 60) return 'Az önce';
    if (diff < 3600) return `${Math.floor(diff / 60)} dk önce`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} saat önce`;
    return date.toLocaleDateString('tr-TR');
  };

  return (
    <>
      {/* Notification Bell Button */}
      <button
        onClick={togglePanel}
        className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors"
      >
        <Bell className="w-6 h-6 text-gray-600" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Panel Overlay */}
      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setOpen(false)}
          />
          <div className="fixed right-4 top-16 z-50 w-96 bg-white rounded-lg shadow-2xl border border-gray-200 max-h-[600px] flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Bildirimler</h3>
                {unreadCount > 0 && (
                  <p className="text-sm text-gray-500">{unreadCount} okunmamış</p>
                )}
              </div>
              {notifications.length > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  Tümünü Okundu İşaretle
                </button>
              )}
            </div>

            {/* Notifications List */}
            <div className="flex-1 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                  <Bell className="w-12 h-12 mb-3 opacity-30" />
                  <p className="text-sm">Henüz bildirim yok</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 hover:bg-gray-50 transition-colors ${
                        !notification.read ? 'bg-blue-50/50' : ''
                      }`}
                      onClick={() => !notification.read && handleMarkAsRead(notification.id)}
                    >
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5">{getIcon(notification.type)}</div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="text-sm font-medium text-gray-900">
                              {notification.title}
                            </h4>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(notification.id);
                              }}
                              className="text-gray-400 hover:text-gray-600"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">
                            {notification.message}
                          </p>
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-xs text-gray-500">
                              {formatTime(notification.createdAt)}
                            </span>
                            {!notification.read && (
                              <span className="w-2 h-2 bg-blue-600 rounded-full" />
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
};

// Notification Banner Component (for important/urgent notifications)
export const NotificationBanner = () => {
  const [bannerNotifications, setBannerNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    // Subscribe to new notifications
    const unsubscribe = useNotificationStore.subscribe(
      (state) => {
        // Show banner only for ERROR and WARNING types
        const urgentNotifications = state.notifications.filter(
          (n: Notification) => (n.type === 'ERROR' || n.type === 'WARNING') && !n.read
        );
        setBannerNotifications(urgentNotifications.slice(0, 1)); // Show only one at a time
      }
    );

    return unsubscribe;
  }, []);

  const handleDismiss = (id: number) => {
    useNotificationStore.getState().markAsRead(id);
    setBannerNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  if (bannerNotifications.length === 0) return null;

  const notification = bannerNotifications[0];

  return (
    <div
      className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-50 min-w-[400px] max-w-[600px] ${
        notification.type === 'ERROR'
          ? 'bg-red-500'
          : 'bg-yellow-500'
      } text-white px-6 py-4 rounded-lg shadow-2xl animate-slideDown`}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          {notification.type === 'ERROR' ? (
            <AlertCircle className="w-6 h-6" />
          ) : (
            <AlertTriangle className="w-6 h-6" />
          )}
        </div>
        <div className="flex-1">
          <h4 className="font-semibold text-sm">{notification.title}</h4>
          <p className="text-sm opacity-90 mt-1">{notification.message}</p>
        </div>
        <button
          onClick={() => handleDismiss(notification.id)}
          className="flex-shrink-0 hover:bg-white/20 rounded p-1 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
