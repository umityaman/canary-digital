import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  Bell, 
  BellOff, 
  CheckCheck, 
  Trash2,
  Info,
  CheckCircle,
  AlertTriangle,
  XCircle
} from 'lucide-react-native';
import { useNotificationStore } from '../../stores/notificationStore';
import { colors } from '../../constants/colors';
import type { Notification } from '../../types';

const NotificationScreen = () => {
  const { 
    notifications, 
    unreadCount, 
    isLoading, 
    error, 
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications,
  } = useNotificationStore();

  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    await fetchNotifications();
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadNotifications();
    setRefreshing(false);
  };

  const handleNotificationPress = async (notification: Notification) => {
    if (!notification.read) {
      await markAsRead(notification.id);
    }
    // TODO: Handle navigation based on notification data/type
  };

  const handleMarkAllAsRead = () => {
    if (unreadCount === 0) {
      Alert.alert('Bilgi', 'Tüm bildirimler okundu.');
      return;
    }

    Alert.alert(
      'Tümünü Okundu Olarak İşaretle',
      `${unreadCount} okunmamış bildirimi okundu olarak işaretlemek istediğinize emin misiniz?`,
      [
        { text: 'İptal', style: 'cancel' },
        { text: 'Evet', onPress: () => markAllAsRead() },
      ]
    );
  };

  const handleDelete = (id: number) => {
    Alert.alert(
      'Bildirimi Sil',
      'Bu bildirimi silmek istediğinize emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        { text: 'Sil', style: 'destructive', onPress: () => deleteNotification(id) },
      ]
    );
  };

  const handleClearAll = () => {
    if (notifications.length === 0) {
      Alert.alert('Bilgi', 'Silinecek bildirim yok.');
      return;
    }

    Alert.alert(
      'Tümünü Temizle',
      'Tüm bildirimleri silmek istediğinize emin misiniz? Bu işlem geri alınamaz.',
      [
        { text: 'İptal', style: 'cancel' },
        { text: 'Tümünü Sil', style: 'destructive', onPress: () => clearAllNotifications() },
      ]
    );
  };

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'SUCCESS':
        return <CheckCircle size={20} color={colors.success} />;
      case 'WARNING':
        return <AlertTriangle size={20} color={colors.warning} />;
      case 'ERROR':
        return <XCircle size={20} color={colors.error} />;
      case 'INFO':
      default:
        return <Info size={20} color={colors.info} />;
    }
  };

  const getNotificationColor = (type: Notification['type']) => {
    switch (type) {
      case 'SUCCESS':
        return colors.success;
      case 'WARNING':
        return colors.warning;
      case 'ERROR':
        return colors.error;
      case 'INFO':
      default:
        return colors.info;
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Şimdi';
    if (minutes < 60) return `${minutes} dk önce`;
    if (hours < 24) return `${hours} saat önce`;
    if (days < 7) return `${days} gün önce`;
    
    return date.toLocaleDateString('tr-TR', { 
      day: 'numeric', 
      month: 'short',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  };

  const renderNotificationItem = ({ item }: { item: Notification }) => {
    const iconColor = getNotificationColor(item.type);
    
    return (
      <TouchableOpacity
        style={[
          styles.notificationCard,
          !item.read && styles.notificationCardUnread,
        ]}
        onPress={() => handleNotificationPress(item)}
        activeOpacity={0.7}
      >
        <View style={styles.notificationContent}>
          {/* Icon */}
          <View style={[styles.iconContainer, { backgroundColor: iconColor + '20' }]}>
            {getNotificationIcon(item.type)}
          </View>

          {/* Content */}
          <View style={styles.textContainer}>
            <Text style={[styles.title, !item.read && styles.titleUnread]}>
              {item.title}
            </Text>
            <Text style={styles.message} numberOfLines={2}>
              {item.message}
            </Text>
            <Text style={styles.time}>{formatTime(item.createdAt)}</Text>
          </View>

          {/* Unread indicator */}
          {!item.read && <View style={styles.unreadDot} />}
        </View>

        {/* Delete button */}
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDelete(item.id)}
        >
          <Trash2 size={16} color={colors.error} />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.headerTop}>
        <View>
          <Text style={styles.headerTitle}>Bildirimler</Text>
          {unreadCount > 0 && (
            <Text style={styles.headerSubtitle}>
              {unreadCount} okunmamış bildirim
            </Text>
          )}
        </View>
        
        <View style={styles.headerActions}>
          {unreadCount > 0 && (
            <TouchableOpacity
              style={styles.headerButton}
              onPress={handleMarkAllAsRead}
            >
              <CheckCheck size={20} color={colors.primary} />
            </TouchableOpacity>
          )}
          
          {notifications.length > 0 && (
            <TouchableOpacity
              style={styles.headerButton}
              onPress={handleClearAll}
            >
              <Trash2 size={20} color={colors.error} />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );

  const renderEmpty = () => {
    if (error) {
      return (
        <View style={styles.emptyContainer}>
          <BellOff size={64} color={colors.textSecondary} />
          <Text style={styles.emptyTitle}>Hata!</Text>
          <Text style={styles.emptyText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadNotifications}>
            <Text style={styles.retryButtonText}>Tekrar Dene</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View style={styles.emptyContainer}>
        <Bell size={64} color={colors.textSecondary} />
        <Text style={styles.emptyTitle}>Bildirim Yok</Text>
        <Text style={styles.emptyText}>
          Henüz hiç bildiriminiz yok. Yeni bildirimler burada görünecek.
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <FlatList
        data={notifications}
        renderItem={renderNotificationItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={!isLoading ? renderEmpty : null}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      />

      {/* Loading Overlay */}
      {isLoading && !refreshing && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Yükleniyor...</Text>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  listContent: {
    padding: 16,
  },
  header: {
    marginBottom: 16,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
  },
  headerSubtitle: {
    fontSize: 14,
    color: colors.primary,
    marginTop: 4,
    fontWeight: '600',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  notificationCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  notificationCardUnread: {
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
    backgroundColor: colors.primary + '08',
  },
  notificationContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  titleUnread: {
    fontWeight: 'bold',
  },
  message: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: 4,
  },
  time: {
    fontSize: 12,
    color: colors.textDisabled,
  },
  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary,
    marginLeft: 8,
    marginTop: 4,
  },
  deleteButton: {
    alignSelf: 'flex-end',
    padding: 8,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: colors.textOnPrimary,
    fontSize: 14,
    fontWeight: '600',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: colors.textSecondary,
  },
});

export default NotificationScreen;
