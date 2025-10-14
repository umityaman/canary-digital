import React, { useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import {
  Calendar,
  User,
  Phone,
  Mail,
  MapPin,
  Package,
  DollarSign,
  Clock,
  FileText,
  XCircle,
  CheckCircle,
} from 'lucide-react-native';
import { useReservationStore } from '../../stores/reservationStore';
import { ReservationStackParamList } from '../../types';
import { colors } from '../../constants/colors';
import { formatCurrency } from '../../utils/formatters';

type RouteProps = RouteProp<ReservationStackParamList, 'ReservationDetail'>;

const ReservationDetailScreen = () => {
  const route = useRoute<RouteProps>();
  const navigation = useNavigation();
  const { reservationId } = route.params;

  const { 
    selectedReservation, 
    isLoading, 
    error, 
    fetchReservationById,
    cancelReservation 
  } = useReservationStore();

  useEffect(() => {
    loadReservation();
  }, [reservationId]);

  const loadReservation = async () => {
    await fetchReservationById(reservationId);
  };

  const handleCancelReservation = () => {
    Alert.alert(
      'Rezervasyonu İptal Et',
      'Bu rezervasyonu iptal etmek istediğinizden emin misiniz?',
      [
        { text: 'Hayır', style: 'cancel' },
        {
          text: 'Evet, İptal Et',
          style: 'destructive',
          onPress: async () => {
            const success = await cancelReservation(reservationId);
            if (success) {
              Alert.alert('Başarılı', 'Rezervasyon iptal edildi');
              navigation.goBack();
            }
          },
        },
      ]
    );
  };

  const getStatusColor = (status: string) => {
    const statusMap: { [key: string]: string } = {
      PENDING: colors.warning,
      CONFIRMED: colors.info,
      IN_PROGRESS: colors.primary,
      COMPLETED: colors.success,
      CANCELLED: colors.error,
      REJECTED: colors.error,
    };
    return statusMap[status] || colors.textSecondary;
  };

  const getStatusText = (status: string) => {
    const statusMap: { [key: string]: string } = {
      PENDING: 'Beklemede',
      CONFIRMED: 'Onaylandı',
      IN_PROGRESS: 'Devam Ediyor',
      COMPLETED: 'Tamamlandı',
      CANCELLED: 'İptal Edildi',
      REJECTED: 'Reddedildi',
    };
    return statusMap[status] || status;
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('tr-TR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  const formatDateTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleString('tr-TR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading || !selectedReservation) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Yükleniyor...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadReservation}>
            <Text style={styles.retryButtonText}>Tekrar Dene</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const reservation = selectedReservation;
  const statusColor = getStatusColor(reservation.status);
  const canCancel = ['PENDING', 'CONFIRMED'].includes(reservation.status);

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header Card */}
        <View style={styles.headerCard}>
          <Text style={styles.reservationNo}>{reservation.reservationNo}</Text>
          <View style={[styles.statusBadge, { backgroundColor: statusColor + '20' }]}>
            <Text style={[styles.statusText, { color: statusColor }]}>
              {getStatusText(reservation.status)}
            </Text>
          </View>
          <Text style={styles.createdAt}>
            Oluşturulma: {formatDateTime(reservation.createdAt)}
          </Text>
        </View>

        {/* Customer Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Müşteri Bilgileri</Text>
          <View style={styles.infoRow}>
            <User size={18} color={colors.primary} />
            <Text style={styles.infoText}>{reservation.customerName}</Text>
          </View>
          <View style={styles.infoRow}>
            <Mail size={18} color={colors.primary} />
            <Text style={styles.infoText}>{reservation.customerEmail}</Text>
          </View>
          <View style={styles.infoRow}>
            <Phone size={18} color={colors.primary} />
            <Text style={styles.infoText}>{reservation.customerPhone}</Text>
          </View>
          {reservation.customerAddress && (
            <View style={styles.infoRow}>
              <MapPin size={18} color={colors.primary} />
              <Text style={styles.infoText}>{reservation.customerAddress}</Text>
            </View>
          )}
        </View>

        {/* Date Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Rezervasyon Tarihleri</Text>
          <View style={styles.dateGrid}>
            <View style={styles.dateCard}>
              <Calendar size={20} color={colors.success} />
              <Text style={styles.dateLabel}>Başlangıç</Text>
              <Text style={styles.dateValue}>{formatDate(reservation.startDate)}</Text>
              {reservation.pickupTime && (
                <Text style={styles.timeValue}>🕐 {reservation.pickupTime}</Text>
              )}
            </View>
            <View style={styles.dateCard}>
              <Calendar size={20} color={colors.error} />
              <Text style={styles.dateLabel}>Bitiş</Text>
              <Text style={styles.dateValue}>{formatDate(reservation.endDate)}</Text>
              {reservation.returnTime && (
                <Text style={styles.timeValue}>🕐 {reservation.returnTime}</Text>
              )}
            </View>
          </View>
        </View>

        {/* Items */}
        {reservation.items && reservation.items.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Ekipmanlar</Text>
            {reservation.items.map((item, index) => (
              <View key={index} style={styles.itemCard}>
                <View style={styles.itemHeader}>
                  <Package size={18} color={colors.primary} />
                  <Text style={styles.itemName}>{item.equipmentName}</Text>
                </View>
                <View style={styles.itemDetails}>
                  <Text style={styles.itemDetail}>Kategori: {item.equipmentCategory}</Text>
                  <Text style={styles.itemDetail}>Adet: {item.quantity}</Text>
                  <Text style={styles.itemDetail}>Günlük: {formatCurrency(item.dailyPrice)}</Text>
                  <Text style={styles.itemDetail}>Gün: {item.numberOfDays}</Text>
                </View>
                <View style={styles.itemFooter}>
                  <Text style={styles.itemSubtotal}>
                    Ara Toplam: {formatCurrency(item.subtotal)}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Pricing */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ödeme Bilgileri</Text>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Ara Toplam</Text>
            <Text style={styles.priceValue}>{formatCurrency(reservation.subtotal)}</Text>
          </View>
          {reservation.discountAmount > 0 && (
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>İndirim</Text>
              <Text style={[styles.priceValue, { color: colors.success }]}>
                -{formatCurrency(reservation.discountAmount)}
              </Text>
            </View>
          )}
          {reservation.deliveryFee && reservation.deliveryFee > 0 && (
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Teslimat Ücreti</Text>
              <Text style={styles.priceValue}>{formatCurrency(reservation.deliveryFee)}</Text>
            </View>
          )}
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>KDV (%{reservation.taxRate})</Text>
            <Text style={styles.priceValue}>{formatCurrency(reservation.taxAmount)}</Text>
          </View>
          <View style={[styles.priceRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Toplam</Text>
            <Text style={styles.totalValue}>{formatCurrency(reservation.totalAmount)}</Text>
          </View>

          {reservation.depositAmount > 0 && (
            <>
              <View style={styles.divider} />
              <View style={styles.priceRow}>
                <Text style={styles.priceLabel}>Kapora</Text>
                <View style={styles.depositInfo}>
                  <Text style={styles.priceValue}>{formatCurrency(reservation.depositAmount)}</Text>
                  {reservation.depositPaid ? (
                    <CheckCircle size={16} color={colors.success} />
                  ) : (
                    <XCircle size={16} color={colors.warning} />
                  )}
                </View>
              </View>
              <View style={styles.priceRow}>
                <Text style={styles.priceLabel}>Kalan</Text>
                <Text style={styles.priceValue}>{formatCurrency(reservation.remainingAmount)}</Text>
              </View>
            </>
          )}
        </View>

        {/* Notes */}
        {(reservation.notes || reservation.specialRequests) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Notlar</Text>
            {reservation.notes && (
              <View style={styles.noteCard}>
                <FileText size={16} color={colors.textSecondary} />
                <Text style={styles.noteText}>{reservation.notes}</Text>
              </View>
            )}
            {reservation.specialRequests && (
              <View style={styles.noteCard}>
                <FileText size={16} color={colors.warning} />
                <Text style={styles.noteText}>{reservation.specialRequests}</Text>
              </View>
            )}
          </View>
        )}

        {/* Cancel Button */}
        {canCancel && (
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={handleCancelReservation}
          >
            <XCircle size={20} color={colors.textOnPrimary} />
            <Text style={styles.cancelButtonText}>Rezervasyonu İptal Et</Text>
          </TouchableOpacity>
        )}
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
    padding: 16,
    paddingBottom: 32,
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
  headerCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
  },
  reservationNo: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    fontFamily: 'monospace',
    marginBottom: 8,
  },
  statusBadge: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 8,
    marginBottom: 8,
  },
  statusText: {
    fontSize: 13,
    fontWeight: 'bold',
  },
  createdAt: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  section: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 10,
  },
  infoText: {
    fontSize: 14,
    color: colors.text,
    flex: 1,
  },
  dateGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  dateCard: {
    flex: 1,
    backgroundColor: colors.background,
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  dateLabel: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 8,
    marginBottom: 4,
  },
  dateValue: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
  },
  timeValue: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
  },
  itemCard: {
    backgroundColor: colors.background,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    flex: 1,
  },
  itemDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 8,
  },
  itemDetail: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  itemFooter: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 8,
  },
  itemSubtotal: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'right',
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  priceLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  priceValue: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
  },
  totalRow: {
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 2,
    borderTopColor: colors.border,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.primary,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 12,
  },
  depositInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  noteCard: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: colors.background,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  noteText: {
    fontSize: 13,
    color: colors.text,
    flex: 1,
    lineHeight: 20,
  },
  cancelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.error,
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 8,
  },
  cancelButtonText: {
    color: colors.textOnPrimary,
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ReservationDetailScreen;
