import React, { useEffect, useState, useMemo } from 'react';
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
import { StackNavigationProp } from '@react-navigation/stack';
import { Search, Filter, QrCode, X } from 'lucide-react-native';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import { useEquipmentStore } from '../../stores/equipmentStore';
import EquipmentCard from '../../components/EquipmentCard';
import { EquipmentStackParamList } from '../../types';
import { colors } from '../../constants/colors';
import { Input, Button, Card, Badge, Chip } from '../../components/ui';
import { theme } from '../../constants/theme';

type NavigationProp = StackNavigationProp<EquipmentStackParamList, 'EquipmentList'>;

const EquipmentListScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const { equipment, isLoading, error, fetchEquipment, setFilters, filters } = useEquipmentStore();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Memoized filtered equipment for performance
  const filteredEquipment = useMemo(() => {
    return equipment.filter(item => {
      const matchesStatus = !selectedStatus || item.status === selectedStatus;
      const matchesCategory = !selectedCategory || item.category === selectedCategory;
      return matchesStatus && matchesCategory;
    });
  }, [equipment, selectedStatus, selectedCategory]);

  useEffect(() => {
    loadEquipment();
  }, []);

  const loadEquipment = async () => {
    await fetchEquipment();
  };

  const handleSearch = (text: string) => {
    setSearchQuery(text);
    setFilters({ search: text });
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setFilters({ search: undefined });
  };

  const handleQRScan = () => {
    navigation.navigate('QRScanner');
  };

  const handleEquipmentPress = (equipmentId: number) => {
    navigation.navigate('EquipmentDetail', { equipmentId });
  };

  const renderEmpty = () => {
    if (isLoading) {
      return null;
    }

    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>
          {error ? error : 'Ekipman bulunamadı'}
        </Text>
        {error && (
          <TouchableOpacity style={styles.retryButton} onPress={loadEquipment}>
            <Text style={styles.retryButtonText}>Tekrar Dene</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const renderHeader = () => (
    <View style={styles.header}>
      {/* Search Bar with New Input Component */}
      <Animated.View entering={FadeIn.duration(300)} style={styles.searchContainer}>
        <View style={{ flex: 1 }}>
          <Input
            placeholder="Ekipman ara..."
            value={searchQuery}
            onChangeText={handleSearch}
            icon="search"
            rightIcon={searchQuery.length > 0 ? "close-circle" : undefined}
            onRightIconPress={handleClearSearch}
          />
        </View>
        
        {/* QR Scan Button */}
        <TouchableOpacity style={styles.qrButtonNew} onPress={handleQRScan}>
          <QrCode size={24} color={colors.primary} />
        </TouchableOpacity>
      </Animated.View>

      {/* Filter Chips */}
      <Animated.View entering={FadeInDown.delay(100).springify()} style={styles.filterChips}>
        <Chip
          label="Hepsi"
          selected={!selectedStatus}
          onPress={() => setSelectedStatus(null)}
          size="small"
        />
        <Chip
          label="Müsait"
          variant="filled"
          selected={selectedStatus === 'available'}
          onPress={() => setSelectedStatus(selectedStatus === 'available' ? null : 'available')}
          size="small"
        />
        <Chip
          label="Kirada"
          variant="filled"
          selected={selectedStatus === 'rented'}
          onPress={() => setSelectedStatus(selectedStatus === 'rented' ? null : 'rented')}
          size="small"
        />
        <Chip
          label="Bakımda"
          variant="filled"
          selected={selectedStatus === 'maintenance'}
          onPress={() => setSelectedStatus(selectedStatus === 'maintenance' ? null : 'maintenance')}
          size="small"
        />
      </Animated.View>

      {/* Stats */}
      <Animated.View entering={FadeInDown.delay(200).springify()} style={styles.stats}>
        <Badge variant="info" size="medium">
          {`${filteredEquipment.length} ekipman`}
        </Badge>
        {searchQuery && (
          <Text style={styles.searchInfo}>"{searchQuery}" için sonuçlar</Text>
        )}
      </Animated.View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <FlatList
        data={filteredEquipment}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item, index }) => (
          <Animated.View entering={FadeInDown.delay(index * 50).springify()}>
            <EquipmentCard
              equipment={item}
              onPress={() => handleEquipmentPress(item.id)}
            />
          </Animated.View>
        )}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={loadEquipment}
            colors={[colors.primary]}
          />
        }
        // Performance optimizations
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        windowSize={5}
        removeClippedSubviews={true}
      />

      {/* Loading Overlay */}
      {isLoading && equipment.length === 0 && (
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
  searchContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
  },
  qrButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  qrButtonNew: {
    width: 52,
    paddingHorizontal: 0,
  },
  filterChips: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
    flexWrap: 'wrap',
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    gap: 12,
  },
  statsText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  searchInfo: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 16,
    textAlign: 'center',
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
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
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

export default EquipmentListScreen;
