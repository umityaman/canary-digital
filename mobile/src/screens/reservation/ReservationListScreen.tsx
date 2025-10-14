import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Plus, Filter } from 'lucide-react-native';
import { useReservationStore } from '../../stores/reservationStore';
import ReservationCard from '../../components/ReservationCard';
import { colors } from '../../constants/colors';
import type { ReservationStackNavigationProp } from '../../types';

const ReservationListScreen = () => {
  const navigation = useNavigation<ReservationStackNavigationProp>();
  
  const { 
    reservations, 
    isLoading, 
    error, 
    filters,
    fetchReservations,
    setFilters 
  } = useReservationStore();

  const [refreshing, setRefreshing] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string | undefined>(undefined);

  useEffect(() => {
    loadReservations();
  }, []);

  const loadReservations = async () => {
    await fetchReservations();
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadReservations();
    setRefreshing(false);
  };

  const handleReservationPress = (reservationId: number) => {
    navigation.navigate('ReservationDetail', { reservationId });
  };

  const handleCreateReservation = () => {
    navigation.navigate('CreateReservation');
  };

  const handleFilterByStatus = (status: string | undefined) => {
    setSelectedStatus(status);
    setFilters({ ...filters, status });
    fetchReservations();
  };

  const renderEmpty = () => {
    if (error) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadReservations}>
            <Text style={styles.retryButtonText}>Tekrar Dene</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Henüz rezervasyon yok</Text>
        <Text style={styles.emptySubtext}>Yeni rezervasyon oluşturmak için + butonuna tıklayın</Text>
      </View>
    );
  };

  const statusFilters = [
    { label: 'Tümü', value: undefined },
    { label: 'Beklemede', value: 'PENDING' },
    { label: 'Onaylandı', value: 'CONFIRMED' },
    { label: 'Devam Ediyor', value: 'IN_PROGRESS' },
    { label: 'Tamamlandı', value: 'COMPLETED' },
    { label: 'İptal', value: 'CANCELLED' },
  ];

  const renderHeader = () => (
    <View style={styles.header}>
      {/* Stats */}
      <View style={styles.statsContainer}>
        <Text style={styles.statsText}>
          Toplam {reservations.length} rezervasyon
        </Text>
        {selectedStatus && (
          <Text style={styles.statsSubtext}>
            ({statusFilters.find(f => f.value === selectedStatus)?.label} filtrelendi)
          </Text>
        )}
      </View>

      {/* Status Filters */}
      <View style={styles.filtersContainer}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={statusFilters}
          keyExtractor={(item) => item.value || 'all'}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.filterChip,
                selectedStatus === item.value && styles.filterChipActive
              ]}
              onPress={() => handleFilterByStatus(item.value)}
            >
              <Text
                style={[
                  styles.filterChipText,
                  selectedStatus === item.value && styles.filterChipTextActive
                ]}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          )}
          contentContainerStyle={styles.filtersContent}
        />
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <FlatList
        data={reservations}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <ReservationCard
            reservation={item}
            onPress={() => handleReservationPress(item.id)}
          />
        )}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={!isLoading ? renderEmpty : null}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      />

      {/* Create Button */}
      <TouchableOpacity
        style={styles.createButton}
        onPress={handleCreateReservation}
        activeOpacity={0.8}
      >
        <Plus size={28} color={colors.textOnPrimary} />
      </TouchableOpacity>

      {/* Loading Overlay */}
      {isLoading && reservations.length === 0 && (
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
    paddingBottom: 80,
  },
  header: {
    marginBottom: 16,
  },
  statsContainer: {
    marginBottom: 12,
  },
  statsText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  statsSubtext: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  filtersContainer: {
    marginBottom: 8,
  },
  filtersContent: {
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: 8,
  },
  filterChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.text,
  },
  filterChipTextActive: {
    color: colors.textOnPrimary,
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 16,
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: colors.textOnPrimary,
    fontSize: 14,
    fontWeight: '600',
  },
  createButton: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: colors.textSecondary,
  },
});

export default ReservationListScreen;
