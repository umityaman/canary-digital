import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Calendar, User, Package, DollarSign, ChevronRight } from 'lucide-react-native';
import { colors } from '../constants/colors';
import { formatCurrency } from '../utils/formatters';
import type { Reservation } from '../types';

interface ReservationCardProps {
  reservation: Reservation;
  onPress: () => void;
}

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

export const ReservationCard: React.FC<ReservationCardProps> = ({ reservation, onPress }) => {
  const statusColor = statusColors[reservation.status];
  const statusLabel = statusLabels[reservation.status];

  // Calculate duration
  const startDate = new Date(reservation.startDate);
  const endDate = new Date(reservation.endDate);
  const durationDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

  // Format dates
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('tr-TR', { 
      day: 'numeric', 
      month: 'short',
      year: 'numeric'
    });
  };

  // Check if reservation is upcoming, active, or past
  const now = new Date();
  const isUpcoming = startDate > now;
  const isActive = startDate <= now && endDate >= now;
  const isPast = endDate < now;

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      {/* Status Badge */}
      <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
        <Text style={styles.statusText}>{statusLabel}</Text>
      </View>

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.reservationNo}>{reservation.reservationNo}</Text>
          {isUpcoming && (
            <View style={styles.timingBadge}>
              <Text style={styles.timingText}>Yaklaşan</Text>
            </View>
          )}
          {isActive && (
            <View style={[styles.timingBadge, { backgroundColor: colors.success + '20' }]}>
              <Text style={[styles.timingText, { color: colors.success }]}>Aktif</Text>
            </View>
          )}
        </View>
        <ChevronRight size={20} color={colors.textSecondary} />
      </View>

      {/* Customer Info */}
      <View style={styles.infoRow}>
        <User size={16} color={colors.primary} />
        <Text style={styles.infoText}>{reservation.customerName}</Text>
      </View>

      <View style={styles.infoRow}>
        <Calendar size={16} color={colors.info} />
        <Text style={styles.infoText}>
          {formatDate(startDate)} - {formatDate(endDate)}
        </Text>
        <Text style={styles.durationText}>({durationDays} gün)</Text>
      </View>

      {/* Items Count */}
      <View style={styles.infoRow}>
        <Package size={16} color={colors.secondary} />
        <Text style={styles.infoText}>
          {reservation.items.length} ekipman ({reservation.items.reduce((sum, item) => sum + item.quantity, 0)} adet)
        </Text>
      </View>

      {/* Divider */}
      <View style={styles.divider} />

      {/* Bottom Info */}
      <View style={styles.bottomRow}>
        <View style={styles.priceContainer}>
          <DollarSign size={18} color={colors.success} />
          <Text style={styles.totalAmount}>{formatCurrency(reservation.totalAmount)}</Text>
        </View>

        {/* Deposit Info */}
        {reservation.depositAmount > 0 && (
          <View style={styles.depositBadge}>
            <Text style={styles.depositText}>
              {reservation.depositPaid ? '✓ Depozito Ödendi' : '⚠ Depozito Bekliyor'}
            </Text>
          </View>
        )}
      </View>

      {/* Notes Preview */}
      {reservation.notes && (
        <View style={styles.notesContainer}>
          <Text style={styles.notesText} numberOfLines={2}>
            Not: {reservation.notes}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    position: 'relative',
  },
  statusBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    color: colors.textOnPrimary,
    fontSize: 11,
    fontWeight: 'bold',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
    paddingRight: 80,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  reservationNo: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
  },
  timingBadge: {
    backgroundColor: colors.warning + '20',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  timingText: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.warning,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  infoText: {
    fontSize: 13,
    color: colors.text,
    flex: 1,
  },
  durationText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 12,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.success,
  },
  depositBadge: {
    backgroundColor: colors.info + '15',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  depositText: {
    fontSize: 11,
    color: colors.info,
    fontWeight: '600',
  },
  notesContainer: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  notesText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
});
