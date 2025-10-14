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
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import { 
  User, 
  Phone, 
  Mail, 
  Calendar, 
  Package, 
  DollarSign, 
  FileText,
  XCircle,
  CheckCircle,
  Clock
} from 'lucide-react-native';
import { useReservationStore } from '../../stores/reservationStore';
import { colors } from '../../constants/colors';
import { formatCurrency } from '../../utils/formatters';
import type { ReservationStackParamList } from '../../types';

type RouteProps = RouteProp<ReservationStackParamList, 'ReservationDetail'>;

const statusColors = {
  PENDING: '#FFA500',
  CONFIRMED: '#4CAF50',
  IN_PROGRESS: '#2196F3',
  COMPLETED: '#9E9E9E',
  CANCELLED: '#F44336',
};

const statusLabels = {
  PENDING: 'Beklemede',
  CONFIRMED: 'Onaylandı',
  IN_PROGRESS: 'Devam Ediyor',
  COMPLETED: 'Tamamlandı',
  CANCELLED: 'İptal Edildi',
};

const ReservationDetailScreen = () => {
  const route = useRoute<RouteProps>();
  const navigation = useNavigation();
  const { reservationId } = route.params;
  
  const { selectedReservation, isLoading, error, fetchReservationById, cancelReservation } = useReservationStore();

  useEffect(() => {
    loadReservation();
  }, [reservationId]);

  const loadReservation = async () => {
    await fetchReservationById(reservationId);
  };

  const handleCancelReservation = () => {
    Alert.alert(
      'Rezervasyonu İptal Et',
      'Bu rezervasyonu iptal etmek istediğinize emin misiniz?',
      [
        { text: 'Vazgeç', style: 'cancel' },
        {
          text: 'İptal Et',
          style: 'destructive',
          onPress: async () => {
            const success = await cancelReservation(reservationId);
            if (success) {
              Alert.alert('Başarılı', 'Rezervasyon iptal edildi.', [
                { text: 'Tamam', onPress: () => navigation.goBack() }
              ]);
            }
          }
        }
      ]
    );
  };

  if (isLoading || !selectedReservation) {
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
          <TouchableOpacity style={styles.retryButton} onPress={loadReservation}>
            <Text style={styles.retryButtonText}>Tekrar Dene</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const reservation = selectedReservation;
  const statusColor = statusColors[reservation.status];
  const statusLabel = statusLabels[reservation.status];

  // Calculate duration and dates
  const startDate = new Date(reservation.startDate);
  const endDate = new Date(reservation.endDate);
  const durationDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('tr-TR', { 
      day: 'numeric', 
      month: 'long',
      year: 'numeric',
      weekday: 'long'
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('tr-TR', { 
      hour: '2-digit', 
      minute: '2-digit'
    });
  };

  // Calculate totals
  const totalQuantity = reservation.items.reduce((sum, item) => sum + item.quantity, 0);
  const canCancel = reservation.status === 'PENDING' || reservation.status === 'CONFIRMED';

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header Card */}
        <View style={styles.headerCard}>
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.reservationNo}>{reservation.reservationNo}</Text>
              <Text style={styles.createdDate}>
                Oluşturulma: {new Date(reservation.createdAt).toLocaleDateString('tr-TR')}
              </Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
              <Text style={styles.statusText}>{statusLabel}</Text>
            </View>
          </View>
        </View>

        {/* Customer Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Müşteri Bilgileri</Text>
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <User size={20} color={colors.primary} />
              <Text style={styles.infoLabel}>Ad Soyad</Text>
            </View>
            <Text style={styles.infoValue}>{reservation.customerName}</Text>

            <View style={styles.divider} />

            <View style={styles.infoRow}>
              <Phone size={20} color={colors.success} />
              <Text style={styles.infoLabel}>Telefon</Text>
            </View>
            <Text style={styles.infoValue}>{reservation.customerPhone}</Text>

            <View style={styles.divider} />

            <View style={styles.infoRow}>
              <Mail size={20} color={colors.info} />
              <Text style={styles.infoLabel}>E-posta</Text>
            </View>
            <Text style={styles.infoValue}>{reservation.customerEmail}</Text>
          </View>
        </View>

        {/* Date Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tarih Bilgileri</Text>
          <View style={styles.infoCard}>
            <View style={styles.dateRow}>
              <View style={styles.dateColumn}>
                <View style={styles.dateIcon}>
                  <Calendar size={24} color={colors.primary} />
                </View>
                <Text style={styles.dateLabel}>Başlangıç</Text>
                <Text style={styles.dateValue}>{formatDate(startDate)}</Text>
                <Text style={styles.timeValue}>{formatTime(startDate)}</Text>
              </View>

              <View style={styles.dateDivider}>
                <Text style={styles.durationText}>{durationDays} gün</Text>
              </View>

              <View style={styles.dateColumn}>
                <View style={styles.dateIcon}>
                  <Calendar size={24} color={colors.secondary} />
                </View>
                <Text style={styles.dateLabel}>Bitiş</Text>
                <Text style={styles.dateValue}>{formatDate(endDate)}</Text>
                <Text style={styles.timeValue}>{formatTime(endDate)}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Equipment Items */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Ekipmanlar ({reservation.items.length} ürün, {totalQuantity} adet)
          </Text>
          {reservation.items.map((item, index) => (
            <View key={item.id} style={styles.equipmentCard}>
              <View style={styles.equipmentHeader}>
                <View style={styles.equipmentIcon}>
                  <Package size={20} color={colors.primary} />
                </View>
                <View style={styles.equipmentInfo}>
                  <Text style={styles.equipmentName}>{item.equipment.name}</Text>
                  <Text style={styles.equipmentCode}>{item.equipment.qrCode}</Text>
                </View>
              </View>

              <View style={styles.equipmentDetails}>
                <View style={styles.equipmentDetailRow}>
                  <Text style={styles.equipmentDetailLabel}>Adet:</Text>
                  <Text style={styles.equipmentDetailValue}>{item.quantity}</Text>
                </View>
                <View style={styles.equipmentDetailRow}>
                  <Text style={styles.equipmentDetailLabel}>Günlük Fiyat:</Text>
                  <Text style={styles.equipmentDetailValue}>{formatCurrency(item.dailyPrice)}</Text>
                </View>
                <View style={styles.equipmentDetailRow}>
                  <Text style={styles.equipmentDetailLabel}>Gün:</Text>
                  <Text style={styles.equipmentDetailValue}>{item.durationDays}</Text>
                </View>
                <View style={[styles.equipmentDetailRow, styles.totalRow]}>
                  <Text style={styles.totalLabel}>Toplam:</Text>
                  <Text style={styles.totalValue}>{formatCurrency(item.totalPrice)}</Text>
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* Financial Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Mali Özet</Text>
          <View style={styles.financialCard}>
            <View style={styles.financialRow}>
              <Text style={styles.financialLabel}>Toplam Tutar</Text>
              <Text style={styles.financialValue}>{formatCurrency(reservation.totalAmount)}</Text>
            </View>

            {reservation.depositAmount > 0 && (
              <>
                <View style={styles.divider} />
                <View style={styles.financialRow}>
                  <Text style={styles.financialLabel}>Depozito</Text>
                  <Text style={styles.financialValue}>{formatCurrency(reservation.depositAmount)}</Text>
                </View>
                <View style={styles.depositStatusRow}>
                  {reservation.depositPaid ? (
                    <>
                      <CheckCircle size={16} color={colors.success} />
                      <Text style={[styles.depositStatus, { color: colors.success }]}>Ödendi</Text>
                    </>
                  ) : (
                    <>
                      <Clock size={16} color={colors.warning} />
                      <Text style={[styles.depositStatus, { color: colors.warning }]}>Bekliyor</Text>
                    </>
                  )}
                </View>
              </>
            )}
          </View>
        </View>

        {/* Notes */}
        {reservation.notes && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Notlar</Text>
            <View style={styles.notesCard}>
              <FileText size={20} color={colors.textSecondary} />
              <Text style={styles.notesText}>{reservation.notes}</Text>
            </View>
          </View>
        )}

        {/* Action Buttons */}
        {canCancel && (
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={handleCancelReservation}
            >
              <XCircle size={20} color={colors.textOnPrimary} />
              <Text style={styles.cancelButtonText}>Rezervasyonu İptal Et</Text>
            </TouchableOpacity>
          </View>
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  reservationNo: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  createdDate: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  statusText: {
    color: colors.textOnPrimary,
    fontSize: 12,
    fontWeight: 'bold',
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 12,
  },
  infoCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  infoValue: {
    fontSize: 16,
    color: colors.text,
    marginLeft: 28,
    marginBottom: 12,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 12,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateColumn: {
    flex: 1,
    alignItems: 'center',
  },
  dateIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  dateLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  dateValue: {
    fontSize: 13,
    color: colors.text,
    fontWeight: '600',
    textAlign: 'center',
  },
  timeValue: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  dateDivider: {
    width: 40,
    alignItems: 'center',
  },
  durationText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.primary,
  },
  equipmentCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  equipmentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  equipmentIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  equipmentInfo: {
    flex: 1,
  },
  equipmentName: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },
  equipmentCode: {
    fontSize: 12,
    color: colors.textSecondary,
    fontFamily: 'monospace',
  },
  equipmentDetails: {
    backgroundColor: colors.background,
    borderRadius: 8,
    padding: 12,
  },
  equipmentDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  equipmentDetailLabel: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  equipmentDetailValue: {
    fontSize: 13,
    color: colors.text,
    fontWeight: '600',
  },
  totalRow: {
    marginTop: 6,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.text,
  },
  totalValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.success,
  },
  financialCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  financialRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  financialLabel: {
    fontSize: 15,
    color: colors.text,
    fontWeight: '600',
  },
  financialValue: {
    fontSize: 18,
    color: colors.success,
    fontWeight: 'bold',
  },
  depositStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
  },
  depositStatus: {
    fontSize: 13,
    fontWeight: '600',
  },
  notesCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    gap: 12,
  },
  notesText: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
  },
  actionButtons: {
    marginTop: 8,
  },
  cancelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.error,
    paddingVertical: 16,
    borderRadius: 12,
  },
  cancelButtonText: {
    color: colors.textOnPrimary,
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ReservationDetailScreen;
