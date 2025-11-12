import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Bell, 
  Search, 
  Filter, 
  CheckCircle, 
  AlertCircle, 
  Info, 
  AlertTriangle,
  ExternalLink,
  Trash2,
  Check,
  RefreshCw,
  Calendar,
  User,
  Package,
  Settings
} from 'lucide-react';
import { useNotificationAPI } from '../../hooks/useNotificationAPI';
import { Notification, useNotificationStore } from '../NotificationSystem';
import { toast } from 'react-hot-toast';

interface ExtendedNotification extends Notification {
  data?: {
    priority?: string;
    category?: string;
    actionUrl?: string;
    actionLabel?: string;
  };
}

const NotificationCenter: React.FC = () => {
  const [notifications, setNotifications] = useState<ExtendedNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const { 
    fetchNotifications, 
    markNotificationAsRead, 
    markMultipleAsRead,
    deleteNotification,
    fetchUnreadCount 
  } = useNotificationAPI();
  
  const { markAsRead, removeNotification } = useNotificationStore();

  const categories = [
    { value: 'ALL', label: 'Tümü', icon: null },
    { value: 'RESERVATION', label: 'Rezervasyonlar', icon: Calendar },
    { value: 'ORDER', label: 'Siparişler', icon: Package },
    { value: 'EQUIPMENT', label: 'Ekipman', icon: Settings },
    { value: 'REMINDER', label: 'Hatırlatmalar', icon: Bell },
    { value: 'ALERT', label: 'Uyarılar', icon: AlertTriangle },
  ];

  const types = [
    { value: 'ALL', label: 'Tümü' },
    { value: 'SUCCESS', label: 'Başarılı' },
    { value: 'INFO', label: 'Bilgi' },
    { value: 'WARNING', label: 'Uyarı' },
    { value: 'ERROR', label: 'Hata' },
  ];

  useEffect(() => {
    loadNotifications(true);
  }, [selectedCategory, selectedType, showUnreadOnly, searchTerm]);

  const loadNotifications = async (reset = false) => {
    try {
      setLoading(true);
      const currentPage = reset ? 0 : page;
      const limit = 20;
      const offset = currentPage * limit;

      const fetchedNotifications = await fetchNotifications(limit, offset);
      
      // Apply filters
      let filteredNotifications = fetchedNotifications.filter((notif: any) => {
        // Search filter
        if (searchTerm && !notif.title.toLowerCase().includes(searchTerm.toLowerCase()) && 
            !notif.message.toLowerCase().includes(searchTerm.toLowerCase())) {
          return false;
        }

        // Category filter
        if (selectedCategory !== 'ALL' && notif.data?.category !== selectedCategory) {
          return false;
        }

        // Type filter
        if (selectedType !== 'ALL' && notif.type !== selectedType) {
          return false;
        }

        // Unread filter
        if (showUnreadOnly && notif.read) {
          return false;
        }

        return true;
      });

      if (reset) {
        setNotifications(filteredNotifications);
        setPage(0);
      } else {
        setNotifications(prev => [...prev, ...filteredNotifications]);
      }

      setHasMore(filteredNotifications.length === limit);
      setPage(currentPage + 1);
    } catch (error) {
      console.error('Error loading notifications:', error);
      toast.error('Bildirimler yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id: number) => {
    const success = await markNotificationAsRead(id);
    if (success) {
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === id ? { ...notif, read: true } : notif
        )
      );
      markAsRead(id);
    }
  };

  const handleMarkAllAsRead = async () => {
    const unreadIds = notifications.filter(n => !n.read).map(n => n.id);
    if (unreadIds.length > 0) {
      const success = await markMultipleAsRead(unreadIds);
      if (success) {
        setNotifications(prev => 
          prev.map(notif => ({ ...notif, read: true }))
        );
        unreadIds.forEach(id => markAsRead(id));
        toast.success(`${unreadIds.length} bildirim okundu olarak işaretlendi`);
      }
    }
  };

  const handleDelete = async (id: number) => {
    const success = await deleteNotification(id);
    if (success) {
      setNotifications(prev => prev.filter(notif => notif.id !== id));
      removeNotification(id);
      toast.success('Bildirim silindi');
    }
  };

  const handleActionClick = (actionUrl: string) => {
    if (actionUrl.startsWith('http')) {
      window.open(actionUrl, '_blank');
    } else {
      window.location.href = actionUrl;
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'SUCCESS':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'ERROR':
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      case 'WARNING':
        return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
      case 'INFO':
        return <Info className="w-5 h-5 text-blue-600" />;
      default:
        return <Bell className="w-5 h-5 text-neutral-600" />;
    }
  };

  const getPriorityBadge = (priority?: string) => {
    if (!priority) return null;

    const variants: Record<string, string> = {
      HIGH: 'bg-red-100 text-red-800',
      URGENT: 'bg-red-200 text-red-900',
      NORMAL: 'bg-blue-100 text-blue-800',
      LOW: 'bg-neutral-100 text-gray-800',
    };

    return (
      <Badge className={variants[priority] || variants.NORMAL}>
        {priority}
      </Badge>
    );
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Şimdi';
    if (diffMins < 60) return `${diffMins} dakika önce`;
    if (diffHours < 24) return `${diffHours} saat önce`;
    if (diffDays < 7) return `${diffDays} gün önce`;
    
    return date.toLocaleDateString('tr-TR');
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 flex items-center gap-2">
            <Bell className="w-6 h-6" />
            Bildirim Merkezi
          </h1>
          <p className="text-neutral-600 mt-1">
            {unreadCount > 0 ? `${unreadCount} okunmamış bildirim` : 'Tüm bildirimler okundu'}
          </p>
        </div>
        
        {unreadCount > 0 && (
          <Button onClick={handleMarkAllAsRead} variant="outline">
            <Check className="w-4 h-4 mr-2" />
            Tümünü Okundu İşaretle
          </Button>
        )}
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Bildirim ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-neutral-500"
            >
              {categories.map(category => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>

            {/* Type Filter */}
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-neutral-500"
            >
              {types.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>

            {/* Unread Only */}
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showUnreadOnly}
                onChange={(e) => setShowUnreadOnly(e.target.checked)}
                className="w-4 h-4 text-blue-600 border-neutral-300 rounded focus:ring-neutral-500"
              />
              <span className="text-sm">Sadece okunmamış</span>
            </label>
          </div>
        </CardContent>
      </Card>

      {/* Notifications List */}
      <div className="space-y-3">
        {loading && notifications.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="w-6 h-6 animate-spin mr-2" />
            <span>Yükleniyor...</span>
          </div>
        ) : notifications.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Bell className="w-12 h-12 text-gray-300 mb-3" />
              <p className="text-gray-500">Bildirim bulunamadı</p>
            </CardContent>
          </Card>
        ) : (
          notifications.map((notification) => (
            <Card 
              key={notification.id} 
              className={`transition-all hover:shadow-md ${!notification.read ? 'border-l-4 border-l-blue-500 bg-blue-50/30' : ''}`}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className="flex-shrink-0 mt-1">
                    {getIcon(notification.type)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h4 className="text-sm font-medium text-neutral-900">
                        {notification.title}
                      </h4>
                      <div className="flex items-center gap-2">
                        {getPriorityBadge(notification.data?.priority)}
                        {!notification.read && (
                          <span className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0" />
                        )}
                      </div>
                    </div>

                    <p className="text-sm text-neutral-600 mb-3">
                      {notification.message}
                    </p>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span>{formatTime(notification.createdAt)}</span>
                        {notification.data?.category && (
                          <Badge variant="secondary" className="text-xs">
                            {notification.data.category}
                          </Badge>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Action Button */}
                        {notification.data?.actionUrl && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleActionClick(notification.data!.actionUrl!)}
                            className="text-xs"
                          >
                            <ExternalLink className="w-3 h-3 mr-1" />
                            {notification.data.actionLabel || 'Git'}
                          </Button>
                        )}

                        {/* Mark as Read */}
                        {!notification.read && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleMarkAsRead(notification.id)}
                          >
                            <Check className="w-4 h-4" />
                          </Button>
                        )}

                        {/* Delete */}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDelete(notification.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}

        {/* Load More */}
        {hasMore && !loading && (
          <div className="flex justify-center pt-4">
            <Button 
              onClick={() => loadNotifications(false)} 
              variant="outline"
              disabled={loading}
            >
              Daha Fazla Yükle
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationCenter;