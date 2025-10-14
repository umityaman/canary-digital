import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { Package, ChevronRight } from 'lucide-react-native';
import { Equipment } from '../types';
import { colors, statusColors, categoryColors } from '../constants/colors';
import { formatCurrency } from '../utils/formatters';

interface EquipmentCardProps {
  equipment: Equipment;
  onPress: () => void;
}

const EquipmentCard: React.FC<EquipmentCardProps> = ({ equipment, onPress }) => {
  const statusColor = statusColors[equipment.status] || colors.textSecondary;
  const categoryColor = categoryColors[equipment.category] || categoryColors.default;

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      {/* Image or Placeholder */}
      <View style={styles.imageContainer}>
        {equipment.imageUrl ? (
          <Image source={{ uri: equipment.imageUrl }} style={styles.image} />
        ) : (
          <View style={[styles.imagePlaceholder, { backgroundColor: categoryColor + '20' }]}>
            <Package size={32} color={categoryColor} />
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

      {/* Content */}
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.name} numberOfLines={1}>
              {equipment.name}
            </Text>
            <View style={styles.meta}>
              <View style={[styles.categoryBadge, { backgroundColor: categoryColor + '20' }]}>
                <Text style={[styles.categoryText, { color: categoryColor }]}>
                  {equipment.category}
                </Text>
              </View>
              <Text style={styles.code}>{equipment.qrCode}</Text>
            </View>
          </View>
          <ChevronRight size={20} color={colors.textSecondary} />
        </View>

        {/* Details */}
        <View style={styles.details}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Günlük Fiyat:</Text>
            <Text style={styles.price}>{formatCurrency(equipment.dailyPrice)}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Stok:</Text>
            <Text style={[
              styles.stock,
              equipment.quantity <= 2 && styles.stockLow
            ]}>
              {equipment.availableQuantity}/{equipment.quantity} adet
            </Text>
          </View>
        </View>

        {/* Brand & Model */}
        {(equipment.brand || equipment.model) && (
          <Text style={styles.brandModel} numberOfLines={1}>
            {[equipment.brand, equipment.model].filter(Boolean).join(' · ')}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  imageContainer: {
    width: 120,
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
    top: 8,
    left: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusText: {
    color: colors.textOnPrimary,
    fontSize: 10,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  headerLeft: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  categoryText: {
    fontSize: 11,
    fontWeight: '600',
  },
  code: {
    fontSize: 11,
    color: colors.textSecondary,
    fontFamily: 'monospace',
  },
  details: {
    marginBottom: 8,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  detailLabel: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  price: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.primary,
  },
  stock: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.success,
  },
  stockLow: {
    color: colors.warning,
  },
  brandModel: {
    fontSize: 11,
    color: colors.textDisabled,
    fontStyle: 'italic',
  },
});

export default EquipmentCard;
