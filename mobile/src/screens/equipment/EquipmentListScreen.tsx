import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Search, Filter, QrCode, X } from 'lucide-react-native';
import { useEquipmentStore } from '../../stores/equipmentStore';
import EquipmentCard from '../../components/EquipmentCard';
import { EquipmentStackParamList } from '../../types';
import { colors } from '../../constants/colors';

type NavigationProp = StackNavigationProp<EquipmentStackParamList, 'EquipmentList'>;

const EquipmentListScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const { equipment, isLoading, error, fetchEquipment, setFilters, filters } = useEquipmentStore();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);

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
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Search size={20} color={colors.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Ekipman ara..."
            placeholderTextColor={colors.textSecondary}
            value={searchQuery}
            onChangeText={handleSearch}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={handleClearSearch}>
              <X size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
        
        {/* QR Scan Button */}
        <TouchableOpacity style={styles.qrButton} onPress={handleQRScan}>
          <QrCode size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Stats */}
      <View style={styles.stats}>
        <Text style={styles.statsText}>
          {equipment.length} ekipman
          {filters.search && ` · "${filters.search}" için sonuçlar`}
        </Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <FlatList
        data={equipment}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <EquipmentCard
            equipment={item}
            onPress={() => handleEquipmentPress(item.id)}
          />
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
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statsText: {
    fontSize: 14,
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
