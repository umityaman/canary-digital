import { useState, useCallback, useEffect } from 'react'
import { toast } from 'react-hot-toast'

export type NotificationType = 'payment' | 'invoice' | 'reminder' | 'statement' | 'system'

export interface Notification {
  id: number
  type: NotificationType
  title: string
  message: string
  isRead: boolean
  isUrgent: boolean
  timestamp: string
  actionUrl?: string
  relatedId?: number
}

export interface NotificationStats {
  total: number
  unread: number
  urgent: number
  thisWeek: number
}

export interface NotificationPreferences {
  emailPayments: boolean
  emailInvoices: boolean
  emailReminders: boolean
  smsPayments: boolean
  smsReminders: boolean
  pushNotifications: boolean
}

export interface UseNotificationsReturn {
  // Data
  notifications: Notification[]
  filteredNotifications: Notification[]
  loading: boolean
  stats: NotificationStats
  
  // Filters
  activeFilter: 'all' | 'unread' | NotificationType
  setActiveFilter: (filter: 'all' | 'unread' | NotificationType) => void
  
  // Preferences
  preferences: NotificationPreferences
  updatePreferences: (prefs: Partial<NotificationPreferences>) => Promise<void>
  
  // Operations
  markAsRead: (id: number) => Promise<void>
  markAllAsRead: () => Promise<void>
  deleteNotification: (id: number) => Promise<void>
  deleteAll: () => Promise<void>
  refreshNotifications: () => Promise<void>
  
  // Real-time
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp'>) => void
}

// Mock initial data (in production, fetch from API)
const mockNotifications: Notification[] = [
  {
    id: 1,
    type: 'payment',
    title: 'Ödeme Alındı',
    message: 'ABC Ltd. şirketinden 15,000 TL ödeme alındı',
    isRead: false,
    isUrgent: false,
    timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(), // 5 min ago
  },
  {
    id: 2,
    type: 'invoice',
    title: 'Yeni Fatura',
    message: 'XYZ A.Ş. için fatura oluşturuldu (#INV-2025-0142)',
    isRead: false,
    isUrgent: false,
    timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString(), // 1 hour ago
  },
  {
    id: 3,
    type: 'reminder',
    title: 'Ödeme Hatırlatması',
    message: 'DEF Ticaret - Vadesi yaklaşan 3 fatura',
    isRead: true,
    isUrgent: true,
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
  },
  {
    id: 4,
    type: 'statement',
    title: 'Ekstre Hazır',
    message: 'Ekim 2025 dönemi ekstre raporu oluşturuldu',
    isRead: true,
    isUrgent: false,
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
  },
  {
    id: 5,
    type: 'system',
    title: 'Sistem Güncellemesi',
    message: 'Yeni özellikler eklendi. Detaylar için tıklayın.',
    isRead: false,
    isUrgent: false,
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
    actionUrl: '/updates',
  },
  {
    id: 6,
    type: 'reminder',
    title: 'Ekstre Gönderme',
    message: '5 müşteriye ekstre gönderme zamanı',
    isRead: false,
    isUrgent: true,
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
  },
]

const initialPreferences: NotificationPreferences = {
  emailPayments: true,
  emailInvoices: true,
  emailReminders: true,
  smsPayments: false,
  smsReminders: true,
  pushNotifications: true,
}

export function useNotifications(): UseNotificationsReturn {
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications)
  const [loading, setLoading] = useState(false)
  const [activeFilter, setActiveFilter] = useState<'all' | 'unread' | NotificationType>('all')
  const [preferences, setPreferences] = useState<NotificationPreferences>(initialPreferences)

  // Calculate stats
  const stats: NotificationStats = {
    total: notifications.length,
    unread: notifications.filter(n => !n.isRead).length,
    urgent: notifications.filter(n => n.isUrgent && !n.isRead).length,
    thisWeek: notifications.filter(n => {
      const weekAgo = new Date()
      weekAgo.setDate(weekAgo.getDate() - 7)
      return new Date(n.timestamp) > weekAgo
    }).length,
  }

  // Apply filters
  const filteredNotifications = notifications.filter(notification => {
    if (activeFilter === 'all') return true
    if (activeFilter === 'unread') return !notification.isRead
    return notification.type === activeFilter
  })

  // Mark as read
  const markAsRead = useCallback(async (id: number) => {
    try {
      setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, isRead: true } : n)
      )
      
      // In production, call API
      // await notificationAPI.markAsRead(id)
      
      toast.success('Bildirim okundu olarak işaretlendi')
    } catch (error: any) {
      console.error('Error marking notification as read:', error)
      toast.error('İşlem başarısız oldu')
    }
  }, [])

  // Mark all as read
  const markAllAsRead = useCallback(async () => {
    try {
      setNotifications(prev =>
        prev.map(n => ({ ...n, isRead: true }))
      )
      
      // In production, call API
      // await notificationAPI.markAllAsRead()
      
      toast.success('Tüm bildirimler okundu olarak işaretlendi')
    } catch (error: any) {
      console.error('Error marking all as read:', error)
      toast.error('İşlem başarısız oldu')
    }
  }, [])

  // Delete notification
  const deleteNotification = useCallback(async (id: number) => {
    try {
      setNotifications(prev => prev.filter(n => n.id !== id))
      
      // In production, call API
      // await notificationAPI.delete(id)
      
      toast.success('Bildirim silindi')
    } catch (error: any) {
      console.error('Error deleting notification:', error)
      toast.error('Silme işlemi başarısız oldu')
    }
  }, [])

  // Delete all
  const deleteAll = useCallback(async () => {
    try {
      setNotifications([])
      
      // In production, call API
      // await notificationAPI.deleteAll()
      
      toast.success('Tüm bildirimler silindi')
    } catch (error: any) {
      console.error('Error deleting all notifications:', error)
      toast.error('Silme işlemi başarısız oldu')
    }
  }, [])

  // Refresh notifications
  const refreshNotifications = useCallback(async () => {
    setLoading(true)
    try {
      // In production, fetch from API
      // const response = await notificationAPI.getAll()
      // setNotifications(response.data)
      
      // For now, just reload mock data
      setNotifications(mockNotifications)
      
      toast.success('Bildirimler güncellendi')
    } catch (error: any) {
      console.error('Error refreshing notifications:', error)
      toast.error('Bildirimler yüklenemedi')
    } finally {
      setLoading(false)
    }
  }, [])

  // Update preferences
  const updatePreferences = useCallback(async (prefs: Partial<NotificationPreferences>) => {
    try {
      setPreferences(prev => ({ ...prev, ...prefs }))
      
      // In production, save to API
      // await notificationAPI.updatePreferences(prefs)
      
      toast.success('Tercihler kaydedildi')
    } catch (error: any) {
      console.error('Error updating preferences:', error)
      toast.error('Tercihler kaydedilemedi')
    }
  }, [])

  // Add new notification (for real-time updates)
  const addNotification = useCallback((notification: Omit<Notification, 'id' | 'timestamp'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now(),
      timestamp: new Date().toISOString(),
    }
    
    setNotifications(prev => [newNotification, ...prev])
    
    // Show toast for new notification
    if (notification.isUrgent) {
      toast.error(notification.title, {
        duration: 5000,
        icon: '🚨',
      })
    } else {
      toast(notification.title, {
        icon: '🔔',
      })
    }
  }, [])

  // Load preferences on mount
  useEffect(() => {
    // In production, fetch from API
    // const loadPreferences = async () => {
    //   const response = await notificationAPI.getPreferences()
    //   setPreferences(response.data)
    // }
    // loadPreferences()
  }, [])

  return {
    // Data
    notifications,
    filteredNotifications,
    loading,
    stats,
    
    // Filters
    activeFilter,
    setActiveFilter,
    
    // Preferences
    preferences,
    updatePreferences,
    
    // Operations
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAll,
    refreshNotifications,
    
    // Real-time
    addNotification,
  }
}
