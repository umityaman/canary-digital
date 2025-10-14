import React, { useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, RouteProp } from '@react-navigation/native';
import { Package, Calendar, DollarSign, Info, Phone, Mail } from 'lucide-react-native';
import { useEquipmentStore } from '../../stores/equipmentStore';
import { EquipmentStackParamList } from '../../types';
import { colors, statusColors, categoryColors } from '../../constants/colors';
import { formatCurrency } from '../../utils/formatters';

type RouteProp = RouteProp<EquipmentStackParamList, 'EquipmentDetail'>;

const EquipmentDetailScreen = () => {
  const route = useRoute<RouteProp>();
  const { equipmentId } = route.params;
  
  const { selectedEquipment, isLoading, error, fetchEquipmentById } = useEquipmentStore();

  useEffect(() => {
    loadEquipment();
  }, [equipmentId]);

  const loadEquipment = async () => {
    await fetchEquipmentById(equipmentId);
  };

  if (isLoading || !selectedEquipment) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Yükleniyor...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadEquipment}>
            <Text style={styles.retryButtonText}>Tekrar Dene</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const equipment = selectedEquipment;
  const statusColor = statusColors[equipment.status] || colors.textSecondary;
  const categoryColor = categoryColors[equipment.category] || categoryColors.default;

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Image */}
        <View style={styles.imageContainer}>
          {equipment.imageUrl ? (
            <Image source={{ uri: equipment.imageUrl }} style={styles.image} />
          ) : (
            <View style={[styles.imagePlaceholder, { backgroundColor: categoryColor + '20' }]}>
              <Package size={64} color={categoryColor} />
            </View>
          )}
          
          {/* Status Badge */}
          <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
            <Text style={styles.statusText}>
              {equipment.status === 'AVAILABLE' ? 'Müsait' :
               equipment.status === 'RENTED' ? 'Kiralandı' :
               equipment.status === 'MAINTENANCE' ? 'Bakımda' : 'Hizmet Dışı'}
            </Text>
          </View>
        </View>

        {/* Header Info */}
        <View style={styles.header}>
          <Text style={styles.name}>{equipment.name}</Text>
          <View style={styles.metaRow}>
            <View style={[styles.categoryBadge, { backgroundColor: categoryColor + '20' }]}>
              <Text style={[styles.categoryText, { color: categoryColor }]}>
                {equipment.category}
              </Text>
            </View>
            <Text style={styles.code}>{equipment.qrCode}</Text>
          </View>
        </View>

        {/* Price Card */}
        <View style={styles.priceCard}>
          <View style={styles.priceIcon}>
            <DollarSign size={24} color={colors.primary} />
          </View>
          <View style={styles.priceContent}>
            <Text style={styles.priceLabel}>Günlük Kiralama Fiyatı</Text>
            <Text style={styles.priceValue}>{formatCurrency(equipment.dailyPrice)}</Text>
          </View>
        </View>

        {/* Details Grid */}
        <View style={styles.detailsGrid}>
          <View style={styles.detailCard}>
            <Package size={20} color={colors.success} />
            <Text style={styles.detailLabel}>Stok</Text>
            <Text style={[
              styles.detailValue,
              equipment.quantity <= 2 && styles.detailValueWarning
            ]}>
              {equipment.availableQuantity}/{equipment.quantity}
            </Text>
          </View>

          {equipment.brand && (
            <View style={styles.detailCard}>
              <Info size={20} color={colors.info} />
              <Text style={styles.detailLabel}>Marka</Text>
              <Text style={styles.detailValue}>{equipment.brand}</Text>
            </View>
          )}

          {equipment.model && (
            <View style={styles.detailCard}>
              <Info size={20} color={colors.secondary} />
              <Text style={styles.detailLabel}>Model</Text>
              <Text style={styles.detailValue}>{equipment.model}</Text>
            </View>
          )}

          {equipment.serialNumber && (
            <View style={styles.detailCard}>
              <Info size={20} color={colors.warning} />
              <Text style={styles.detailLabel}>Seri No</Text>
              <Text style={[styles.detailValue, { fontSize: 11 }]}>{equipment.serialNumber}</Text>
            </View>
          )}
        </View>

        {/* Description */}
        {equipment.description && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Açıklama</Text>
            <Text style={styles.description}>{equipment.description}</Text>
          </View>
        )}

        {/* Features */}
        {equipment.features && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Özellikler</Text>
            <Text style={styles.features}>{equipment.features}</Text>
          </View>
        )}

        {/* Action Button */}
        <TouchableOpacity
          style={[
            styles.reserveButton,
            equipment.status !== 'AVAILABLE' && styles.reserveButtonDisabled
          ]}
          disabled={equipment.status !== 'AVAILABLE'}
        >
          <Calendar size={20} color={colors.textOnPrimary} />
          <Text style={styles.reserveButtonText}>
            {equipment.status === 'AVAILABLE' ? 'Rezervasyon Yap' : 'Müsait Değil'}
          </Text>
        </TouchableOpacity>
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
    paddingBottom: 24,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: colors.textSecondary,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: colors.error,
    textAlign: 'center',
    marginBottom: 16,
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
  imageContainer: {
    width: '100%',
    height: 300,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  statusText: {
    color: colors.textOnPrimary,
    fontSize: 12,
    fontWeight: 'bold',
  },
  header: {
    padding: 20,
  },
  name: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  categoryBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 6,
  },
  categoryText: {
    fontSize: 13,
    fontWeight: '600',
  },
  code: {
    fontSize: 13,
    color: colors.textSecondary,
    fontFamily: 'monospace',
  },
  priceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    marginHorizontal: 20,
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  priceIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  priceContent: {
    flex: 1,
  },
  priceLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  priceValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primary,
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 14,
    marginBottom: 20,
  },
  detailCard: {
    width: '47%',
    margin: '1.5%',
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 8,
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
  },
  detailValueWarning: {
    color: colors.warning,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 12,
  },
  description: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  features: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  reserveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.primary,
    marginHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 12,
  },
  reserveButtonDisabled: {
    backgroundColor: colors.textDisabled,
  },
  reserveButtonText: {
    color: colors.textOnPrimary,
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default EquipmentDetailScreen;
