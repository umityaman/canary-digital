import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Package, Calendar, TrendingUp, DollarSign, QrCode, Bell, Users, ShoppingCart } from 'lucide-react-native';
import { useAuthStore } from '../../stores/authStore';
import { useNotificationStore } from '../../stores/notificationStore';
import { useDashboardStore } from '../../stores/dashboardStore';
import { colors } from '../../constants/colors';
import { formatCurrency } from '../../utils/formatters';

const HomeScreen = () => {
  const navigation = useNavigation<any>();
  const { user } = useAuthStore();
  const { unreadCount, fetchNotifications } = useNotificationStore();
  const { stats, fetchDashboardStats } = useDashboardStore();
  const [refreshing, setRefreshing] = React.useState(false);

  useEffect(() => {
    // Fetch data on mount
    fetchNotifications();
    fetchDashboardStats();
  }, []);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await Promise.all([
      fetchNotifications(),
      fetchDashboardStats(),
    ]);
    setRefreshing(false);
  }, []);

  const handleNotificationPress = () => {
    navigation.navigate('Notifications');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Merhaba,</Text>
            <Text style={styles.userName}>{user?.name || 'Kullanıcı'}</Text>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.notificationButton} onPress={handleNotificationPress}>
              <Bell size={24} color={colors.text} />
              {unreadCount > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{unreadCount > 99 ? '99+' : unreadCount}</Text>
                </View>
              )}
            </TouchableOpacity>
            <TouchableOpacity style={styles.qrButton}>
              <QrCode size={24} color={colors.primary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={[styles.statCard, { backgroundColor: '#dbeafe' }]}>
            <View style={styles.statIconContainer}>
              <DollarSign size={24} color={colors.primary} />
            </View>
            <Text style={styles.statValue}>
              {formatCurrency(stats?.overview.currentRevenue || 0)}
            </Text>
            <Text style={styles.statLabel}>Bu Ay Gelir</Text>
            {stats?.overview.revenueChange !== undefined && (
              <Text style={[
                styles.changeText,
                { color: stats.overview.revenueChange >= 0 ? colors.success : colors.error }
              ]}>
                {stats.overview.revenueChange >= 0 ? '+' : ''}
                {stats.overview.revenueChange.toFixed(1)}%
              </Text>
            )}
          </View>

          <View style={[styles.statCard, { backgroundColor: '#e0e7ff' }]}>
            <View style={styles.statIconContainer}>
              <Calendar size={24} color={colors.secondary} />
            </View>
            <Text style={styles.statValue}>
              {stats?.overview.totalReservations || 0}
            </Text>
            <Text style={styles.statLabel}>Toplam Rezervasyon</Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: '#dcfce7' }]}>
            <View style={styles.statIconContainer}>
              <Package size={24} color={colors.success} />
            </View>
            <Text style={styles.statValue}>
              {stats?.overview.activeReservations || 0}
            </Text>
            <Text style={styles.statLabel}>Aktif Rezervasyon</Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: '#fef3c7' }]}>
            <View style={styles.statIconContainer}>
              <ShoppingCart size={24} color={colors.warning} />
            </View>
            <Text style={styles.statValue}>
              {stats?.overview.totalEquipment || 0}
            </Text>
            <Text style={styles.statLabel}>Ekipman</Text>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Hızlı İşlemler</Text>
          <View style={styles.quickActions}>
            <TouchableOpacity style={styles.actionButton}>
              <View style={[styles.actionIcon, { backgroundColor: '#dbeafe' }]}>
                <Calendar size={24} color={colors.primary} />
              </View>
              <Text style={styles.actionText}>Yeni Rezervasyon</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton}>
              <View style={[styles.actionIcon, { backgroundColor: '#e0e7ff' }]}>
                <QrCode size={24} color={colors.secondary} />
              </View>
              <Text style={styles.actionText}>QR Tara</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton}>
              <View style={[styles.actionIcon, { backgroundColor: '#dcfce7' }]}>
                <Package size={24} color={colors.success} />
              </View>
              <Text style={styles.actionText}>Ekipman Ekle</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Recent Activity */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Son Aktiviteler</Text>
          <View style={styles.activityList}>
            {[1, 2, 3].map((item) => (
              <View key={item} style={styles.activityItem}>
                <View style={styles.activityIcon}>
                  <Calendar size={20} color={colors.primary} />
                </View>
                <View style={styles.activityContent}>
                  <Text style={styles.activityTitle}>Yeni Rezervasyon</Text>
                  <Text style={styles.activitySubtitle}>RES-2025-00{item} oluşturuldu</Text>
                </View>
                <Text style={styles.activityTime}>2s önce</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  greeting: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  notificationButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: 6,
    right: 6,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.error,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: colors.textOnPrimary,
    fontSize: 10,
    fontWeight: 'bold',
  },
  qrButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
    marginBottom: 24,
  },
  statCard: {
    width: '47%',
    margin: '1.5%',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  statIconContainer: {
    marginBottom: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  changeText: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 4,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 12,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  actionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  actionText: {
    fontSize: 12,
    color: colors.text,
    textAlign: 'center',
  },
  activityList: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 12,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surfaceVariant,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  activitySubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  activityTime: {
    fontSize: 11,
    color: colors.textDisabled,
  },
});

export default HomeScreen;
