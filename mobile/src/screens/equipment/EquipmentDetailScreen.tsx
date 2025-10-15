import React, { useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, RouteProp } from '@react-navigation/native';
import { Package, Calendar, DollarSign, Info } from 'lucide-react-native';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import { useEquipmentStore } from '../../stores/equipmentStore';
import { EquipmentStackParamList } from '../../types';
import { colors } from '../../constants/colors';
import { formatCurrency } from '../../utils/formatters';
import { Card, Badge, Button, Divider, Avatar } from '../../components/ui';
import { theme } from '../../constants/theme';

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
          <Button variant="primary" onPress={loadEquipment}>
            Tekrar Dene
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  const equipment = selectedEquipment;

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
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Image */}
        <Animated.View entering={FadeIn.duration(400)} style={styles.imageContainer}>
          {equipment.imageUrl ? (
            <Image source={{ uri: equipment.imageUrl }} style={styles.image} />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Avatar icon="cube" size="xlarge" />
            </View>
          )}
          
          {/* Status Badge */}
          <View style={styles.statusBadgeContainer}>
            <Badge variant={getStatusVariant(equipment.status)} size="medium" animated>
              {getStatusLabel(equipment.status)}
            </Badge>
          </View>
        </Animated.View>

        {/* Header Info */}
        <Animated.View entering={FadeInDown.delay(100).springify()} style={styles.header}>
          <Text style={styles.name}>{equipment.name}</Text>
          <View style={styles.metaRow}>
            <Badge variant="default" size="medium">
              {equipment.category}
            </Badge>
            <Text style={styles.code}>{equipment.qrCode}</Text>
          </View>
        </Animated.View>

        {/* Price Card */}
        <Animated.View entering={FadeInDown.delay(200).springify()} style={styles.cardWrapper}>
          <Card variant="elevated">
            <View style={styles.priceCard}>
              <Avatar icon="cash" size="medium" style={{ backgroundColor: theme.colors.primaryLight + '40' }} />
              <View style={styles.priceContent}>
                <Text style={styles.priceLabel}>Günlük Kiralama Fiyatı</Text>
                <Text style={styles.priceValue}>{formatCurrency(equipment.dailyPrice)}</Text>
              </View>
            </View>
          </Card>
        </Animated.View>

        {/* Details Grid */}
        <Animated.View entering={FadeInDown.delay(300).springify()} style={styles.cardWrapper}>
          <Card variant="elevated">
            <View style={styles.detailsGrid}>
              <View style={styles.detailItem}>
                <Avatar icon="cube" size="small" />
                <Text style={styles.detailLabel}>Stok</Text>
                <Badge 
                  variant={equipment.quantity <= 2 ? 'warning' : 'success'} 
                  size="small"
                >
                  {`${equipment.availableQuantity}/${equipment.quantity}`}
                </Badge>
              </View>

              {equipment.brand && (
                <View style={styles.detailItem}>
                  <Avatar icon="information-circle" size="small" />
                  <Text style={styles.detailLabel}>Marka</Text>
                  <Text style={styles.detailValue}>{equipment.brand}</Text>
                </View>
              )}

              {equipment.model && (
                <View style={styles.detailItem}>
                  <Avatar icon="information-circle" size="small" />
                  <Text style={styles.detailLabel}>Model</Text>
                  <Text style={styles.detailValue}>{equipment.model}</Text>
                </View>
              )}

              {equipment.serialNumber && (
                <View style={styles.detailItem}>
                  <Avatar icon="barcode" size="small" />
                  <Text style={styles.detailLabel}>Seri No</Text>
                  <Text style={styles.detailValue} numberOfLines={1}>{equipment.serialNumber}</Text>
                </View>
              )}
            </View>
          </Card>
        </Animated.View>

        {/* Description */}
        {equipment.description && (
          <Animated.View entering={FadeInDown.delay(400).springify()} style={styles.cardWrapper}>
            <Card variant="elevated">
              <Text style={styles.sectionTitle}>Açıklama</Text>
              <Divider spacing={8} />
              <Text style={styles.description}>{equipment.description}</Text>
            </Card>
          </Animated.View>
        )}

        {/* Features */}
        {equipment.features && (
          <Animated.View entering={FadeInDown.delay(500).springify()} style={styles.cardWrapper}>
            <Card variant="elevated">
              <Text style={styles.sectionTitle}>Özellikler</Text>
              <Divider spacing={8} />
              <Text style={styles.features}>{equipment.features}</Text>
            </Card>
          </Animated.View>
        )}

        {/* Action Button */}
        <Animated.View entering={FadeInDown.delay(600).springify()} style={styles.actionButton}>
          <Button
            variant={equipment.status === 'AVAILABLE' ? 'primary' : 'ghost'}
            size="large"
            icon="calendar"
            onPress={() => {}}
            disabled={equipment.status !== 'AVAILABLE'}
            haptic
          >
            {equipment.status === 'AVAILABLE' ? 'Rezervasyon Yap' : 'Müsait Değil'}
          </Button>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContent: {
    paddingBottom: theme.spacing.xxl,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: theme.spacing.md,
    ...theme.typography.body1,
    color: theme.colors.textSecondary,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.xl,
  },
  errorText: {
    ...theme.typography.body1,
    color: theme.colors.error,
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
  },
  imageContainer: {
    width: '100%',
    height: 300,
    position: 'relative',
    backgroundColor: theme.colors.gray100,
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
  statusBadgeContainer: {
    position: 'absolute',
    top: theme.spacing.lg,
    right: theme.spacing.lg,
  },
  header: {
    padding: theme.spacing.xl,
  },
  name: {
    ...theme.typography.h2,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  code: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    fontFamily: 'monospace',
  },
  cardWrapper: {
    marginHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
  },
  priceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.lg,
  },
  priceContent: {
    flex: 1,
  },
  priceLabel: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
  },
  priceValue: {
    ...theme.typography.h2,
    color: theme.colors.primary,
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.md,
  },
  detailItem: {
    width: '47%',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  detailLabel: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
  },
  detailValue: {
    ...theme.typography.body2,
    fontWeight: '600',
    color: theme.colors.text,
    textAlign: 'center',
  },
  sectionTitle: {
    ...theme.typography.h4,
    color: theme.colors.text,
  },
  description: {
    ...theme.typography.body2,
    color: theme.colors.textSecondary,
    lineHeight: 22,
  },
  features: {
    ...theme.typography.body2,
    color: theme.colors.textSecondary,
    lineHeight: 22,
  },
  actionButton: {
    marginHorizontal: theme.spacing.lg,
    marginTop: theme.spacing.lg,
  },
});

export default EquipmentDetailScreen;
