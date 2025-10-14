import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Plus, Filter } from 'lucide-react-native';
import { useReservationStore } from '../../stores/reservationStore';
import { ReservationCard } from '../../components/ReservationCard';
import { colors } from '../../constants/colors';
import type { ReservationStackNavigationProp } from '../../types';

const ReservationListScreen = () => {
  const navigation = useNavigation<ReservationStackNavigationProp>();
  
  const { reservations, isLoading, error, fetchReservations, filters } = useReservationStore();
  const [refreshing, setRefreshing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<'ALL' | 'PENDING' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED'>('ALL');

  useEffect(() => {
    loadReservations();
  }, [filters]);

  const loadReservations = async () => {
    await fetchReservations();
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadReservations();
    setRefreshing(false);
  };

  const handleCreateReservation = () => {
    navigation.navigate('CreateReservation');
  };

  const handleReservationPress = (reservationId: number) => {
    navigation.navigate('ReservationDetail', { reservationId });
  };

  const handleFilterChange = (filter: typeof selectedFilter) => {
    setSelectedFilter(filter);
    // Apply filter to store
    if (filter === 'ALL') {
      useReservationStore.getState().clearFilters();
    } else {
      useReservationStore.getState().setFilters({ status: filter });
    }
  };

  // Filter reservations locally as well
  const filteredReservations = selectedFilter === 'ALL' 
    ? reservations 
    : reservations.filter(r => r.status === selectedFilter);

  // Group by status for stats
  const stats = {
    total: reservations.length,
    pending: reservations.filter(r => r.status === 'PENDING').length,
    confirmed: reservations.filter(r => r.status === 'CONFIRMED').length,
    inProgress: reservations.filter(r => r.status === 'IN_PROGRESS').length,
    completed: reservations.filter(r => r.status === 'COMPLETED').length,
  };

  const renderEmpty = () => {
    if (error) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>Hata!</Text>
          <Text style={styles.emptyText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadReservations}>
            <Text style={styles.retryButtonText}>Tekrar Dene</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyTitle}>Rezervasyon Bulunamadı</Text>
        <Text style={styles.emptyText}>
          {selectedFilter === 'ALL' 
            ? 'Henüz hiç rezervasyon oluşturulmamış.'
            : 'Bu filtre için rezervasyon bulunamadı.'}
        </Text>
        {selectedFilter === 'ALL' && (
          <TouchableOpacity style={styles.createButton} onPress={handleCreateReservation}>
            <Text style={styles.createButtonText}>İlk Rezervasyonu Oluştur</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const renderFilterChips = () => (
    <View style={styles.filterContainer}>
      <TouchableOpacity
        style={[styles.filterChip, selectedFilter === 'ALL' && styles.filterChipActive]}
        onPress={() => handleFilterChange('ALL')}
      >
        <Text style={[styles.filterChipText, selectedFilter === 'ALL' && styles.filterChipTextActive]}>
          Tümü ({stats.total})
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.filterChip, selectedFilter === 'PENDING' && styles.filterChipActive]}
        onPress={() => handleFilterChange('PENDING')}
      >
        <Text style={[styles.filterChipText, selectedFilter === 'PENDING' && styles.filterChipTextActive]}>
          Bekleyen ({stats.pending})
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.filterChip, selectedFilter === 'CONFIRMED' && styles.filterChipActive]}
        onPress={() => handleFilterChange('CONFIRMED')}
      >
        <Text style={[styles.filterChipText, selectedFilter === 'CONFIRMED' && styles.filterChipTextActive]}>
          Onaylı ({stats.confirmed})
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.filterChip, selectedFilter === 'IN_PROGRESS' && styles.filterChipActive]}
        onPress={() => handleFilterChange('IN_PROGRESS')}
      >
        <Text style={[styles.filterChipText, selectedFilter === 'IN_PROGRESS' && styles.filterChipTextActive]}>
          Aktif ({stats.inProgress})
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.headerTop}>
        <View>
          <Text style={styles.headerTitle}>Rezervasyonlar</Text>
          <Text style={styles.headerSubtitle}>
            {filteredReservations.length} rezervasyon
          </Text>
        </View>
        <TouchableOpacity style={styles.addButton} onPress={handleCreateReservation}>
          <Plus size={24} color={colors.textOnPrimary} />
        </TouchableOpacity>
      </View>
      {renderFilterChips()}
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <FlatList
        data={filteredReservations}
        renderItem={({ item }) => (
          <ReservationCard
            reservation={item}
            onPress={() => handleReservationPress(item.id)}
          />
        )}
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
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
  },
  headerSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
  },
  addButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  filterContainer: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
  },
  filterChipTextActive: {
    color: colors.textOnPrimary,
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
  createButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  createButtonText: {
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

export default ReservationListScreen;
