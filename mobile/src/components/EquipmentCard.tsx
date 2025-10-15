import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { Package, ChevronRight } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { Equipment } from '../types';
import { colors, statusColors, categoryColors } from '../constants/colors';
import { formatCurrency } from '../utils/formatters';
import { Card, Badge, Chip, Avatar } from './ui';
import { theme } from '../constants/theme';

interface EquipmentCardProps {
  equipment: Equipment;
  onPress: () => void;
}

const EquipmentCard: React.FC<EquipmentCardProps> = ({ equipment, onPress }) => {
  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'AVAILABLE':
        return 'success';
      case 'RENTED':
        return 'warning';
      case 'MAINTENANCE':
        return 'info';
      default:
        return 'error';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'AVAILABLE':
        return 'Müsait';
      case 'RENTED':
        return 'Kiralandı';
      case 'MAINTENANCE':
        return 'Bakımda';
      default:
        return 'Hizmet Dışı';
    }
  };

  return (
    <TouchableOpacity onPress={handlePress} activeOpacity={0.95}>
      <Card variant="elevated" style={styles.card}>
        <View style={styles.cardContent}>
          {/* Image or Avatar */}
          <View style={styles.imageContainer}>
            {equipment.imageUrl ? (
              <Image source={{ uri: equipment.imageUrl }} style={styles.image} />
            ) : (
              <Avatar icon="cube" size="large" />
            )}
          </View>

          {/* Content */}
          <View style={styles.content}>
            <View style={styles.header}>
              <Text style={styles.name} numberOfLines={1}>
                {equipment.name}
              </Text>
              <ChevronRight size={20} color={theme.colors.textSecondary} />
            </View>

            {/* Badges */}
            <View style={styles.badgeRow}>
              <Badge variant={getStatusVariant(equipment.status)} size="small">
                {getStatusLabel(equipment.status)}
              </Badge>
              <Chip 
                label={equipment.category} 
                variant="outlined" 
                size="small"
              />
            </View>

            {/* Code */}
            <Text style={styles.code}>{equipment.qrCode}</Text>

            {/* Details */}
            <View style={styles.details}>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Günlük Fiyat</Text>
                <Text style={styles.price}>{formatCurrency(equipment.dailyPrice)}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Stok Durumu</Text>
                <Badge 
                  variant={equipment.quantity <= 2 ? 'warning' : 'info'} 
                  size="small"
                >
                  {`${equipment.availableQuantity}/${equipment.quantity}`}
                </Badge>
              </View>
            </View>

            {/* Brand & Model */}
            {(equipment.brand || equipment.model) && (
              <Text style={styles.brandModel} numberOfLines={1}>
                {[equipment.brand, equipment.model].filter(Boolean).join(' · ')}
              </Text>
            )}
          </View>
        </View>
      </Card>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: theme.spacing.md,
  },
  cardContent: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  imageContainer: {
    width: 80,
    height: 80,
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  name: {
    ...theme.typography.h5,
    color: theme.colors.text,
    flex: 1,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.xs,
    flexWrap: 'wrap',
  },
  code: {
    fontSize: 11,
    color: theme.colors.textSecondary,
    fontFamily: 'monospace',
    marginBottom: theme.spacing.sm,
  },
  details: {
    gap: theme.spacing.xs,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabel: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
  },
  price: {
    fontSize: 15,
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  brandModel: {
    fontSize: 11,
    color: theme.colors.textDisabled,
    fontStyle: 'italic',
    marginTop: theme.spacing.xs,
  },
});

export default EquipmentCard;
