import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Package, Calendar, TrendingUp, DollarSign, QrCode, Bell, Users, ShoppingCart } from 'lucide-react-native';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import { useAuthStore } from '../../stores/authStore';
import { useNotificationStore } from '../../stores/notificationStore';
import { useDashboardStore } from '../../stores/dashboardStore';
import { colors } from '../../constants/colors';
import { formatCurrency } from '../../utils/formatters';
import { Card, Button, Badge, Avatar } from '../../components/ui';

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
          <Card variant="elevated" animationDelay={100} style={[styles.statCard, { backgroundColor: '#dbeafe' }]}>
            <View style={styles.statIconContainer}>
              <DollarSign size={24} color={colors.primary} />
            </View>
            <Text style={styles.statValue}>
              {formatCurrency(stats?.overview.currentRevenue || 0)}
            </Text>
            <Text style={styles.statLabel}>Bu Ay Gelir</Text>
            {stats?.overview.revenueChange !== undefined && (
              <Badge 
                variant={stats.overview.revenueChange >= 0 ? 'success' : 'error'}
                size="small"
                animated
              >
                {`${stats.overview.revenueChange >= 0 ? '+' : ''}${stats.overview.revenueChange.toFixed(1)}%`}
              </Badge>
            )}
          </Card>

          <Card variant="elevated" animationDelay={200} style={[styles.statCard, { backgroundColor: '#e0e7ff' }]}>
            <View style={styles.statIconContainer}>
              <Calendar size={24} color={colors.secondary} />
            </View>
            <Text style={styles.statValue}>
              {stats?.overview.totalReservations || 0}
            </Text>
            <Text style={styles.statLabel}>Toplam Rezervasyon</Text>
          </Card>

          <Card variant="elevated" animationDelay={300} style={[styles.statCard, { backgroundColor: '#dcfce7' }]}>
            <View style={styles.statIconContainer}>
              <Package size={24} color={colors.success} />
            </View>
            <Text style={styles.statValue}>
              {stats?.overview.activeReservations || 0}
            </Text>
            <Text style={styles.statLabel}>Aktif Rezervasyon</Text>
          </Card>

          <Card variant="elevated" animationDelay={400} style={[styles.statCard, { backgroundColor: '#fef3c7' }]}>
            <View style={styles.statIconContainer}>
              <ShoppingCart size={24} color={colors.warning} />
            </View>
            <Text style={styles.statValue}>
              {stats?.overview.totalEquipment || 0}
            </Text>
            <Text style={styles.statLabel}>Ekipman</Text>
          </Card>
        </View>

        {/* Quick Actions */}
        <Animated.View entering={FadeInDown.delay(500).springify()} style={styles.section}>
          <Text style={styles.sectionTitle}>Hızlı İşlemler</Text>
          <View style={styles.quickActions}>
            <View style={styles.actionButton}>
              <Button 
                variant="secondary" 
                size="large"
                icon="calendar"
                onPress={() => navigation.navigate('NewReservation')}
              >
                Yeni Rezervasyon
              </Button>
            </View>

            <View style={styles.actionButton}>
              <Button 
                variant="secondary" 
                size="large"
                icon="qr-code"
                onPress={() => navigation.navigate('Scanner')}
              >
                QR Tara
              </Button>
            </View>

            <View style={styles.actionButton}>
              <Button 
                variant="secondary" 
                size="large"
                icon="add"
                onPress={() => navigation.navigate('AddEquipment')}
              >
                Ekipman Ekle
              </Button>
            </View>
          </View>
        </Animated.View>

        {/* Recent Activity */}
        <Animated.View entering={FadeInDown.delay(600).springify()} style={styles.section}>
          <Text style={styles.sectionTitle}>Son Aktiviteler</Text>
          <Card variant="elevated">
            {[1, 2, 3].map((item, index) => (
              <View key={item}>
                <View style={styles.activityItem}>
                  <Avatar 
                    icon="calendar"
                    size="small"
                  />
                  <View style={styles.activityContent}>
                    <Text style={styles.activityTitle}>Yeni Rezervasyon</Text>
                    <Text style={styles.activitySubtitle}>RES-2025-00{item} oluşturuldu</Text>
                  </View>
                  <Badge variant="info" size="small">2s önce</Badge>
                </View>
                {index < 2 && <View style={styles.divider} />}
              </View>
            ))}
          </Card>
        </Animated.View>
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
    margin: 6,
    padding: 16,
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
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 4,
  },
  activityContent: {
    flex: 1,
    marginLeft: 12,
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
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 4,
  },
});

export default HomeScreen;
