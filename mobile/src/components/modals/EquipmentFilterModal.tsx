import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Switch,
} from 'react-native';
import { X, Check } from 'lucide-react-native';
import { colors } from '../../constants/colors';

export interface FilterOptions {
  status?: 'available' | 'in-use' | 'maintenance' | 'retired';
  category?: string;
  sortBy?: 'name' | 'category' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
  showRetired?: boolean;
}

interface EquipmentFilterModalProps {
  visible: boolean;
  onClose: () => void;
  onApply: (filters: FilterOptions) => void;
  currentFilters: FilterOptions;
}

const STATUSES = [
  { value: 'available', label: 'Uygun', color: colors.success },
  { value: 'in-use', label: 'Kullanımda', color: colors.warning },
  { value: 'maintenance', label: 'Bakımda', color: colors.error },
  { value: 'retired', label: 'Kullanım Dışı', color: colors.textSecondary },
];

const CATEGORIES = [
  { value: 'laptop', label: 'Laptop' },
  { value: 'phone', label: 'Telefon' },
  { value: 'tablet', label: 'Tablet' },
  { value: 'monitor', label: 'Monitör' },
  { value: 'keyboard', label: 'Klavye' },
  { value: 'mouse', label: 'Mouse' },
  { value: 'other', label: 'Diğer' },
];

const SORT_OPTIONS = [
  { value: 'name', label: 'İsim' },
  { value: 'category', label: 'Kategori' },
  { value: 'createdAt', label: 'Oluşturma Tarihi' },
];

export const EquipmentFilterModal: React.FC<EquipmentFilterModalProps> = ({
  visible,
  onClose,
  onApply,
  currentFilters,
}) => {
  const [filters, setFilters] = useState<FilterOptions>(currentFilters);

  const handleApply = () => {
    onApply(filters);
    onClose();
  };

  const handleReset = () => {
    const resetFilters: FilterOptions = {};
    setFilters(resetFilters);
    onApply(resetFilters);
  };

  const toggleStatus = (status: FilterOptions['status']) => {
    setFilters({
      ...filters,
      status: filters.status === status ? undefined : status,
    });
  };

  const toggleCategory = (category: string) => {
    setFilters({
      ...filters,
      category: filters.category === category ? undefined : category,
    });
  };

  const setSortBy = (sortBy: FilterOptions['sortBy']) => {
    setFilters({ ...filters, sortBy });
  };

  const toggleSortOrder = () => {
    setFilters({
      ...filters,
      sortOrder: filters.sortOrder === 'asc' ? 'desc' : 'asc',
    });
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Filtreler</Text>
            <TouchableOpacity onPress={onClose}>
              <X size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content}>
            {/* Status Filter */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Durum</Text>
              <View style={styles.optionsGrid}>
                {STATUSES.map((status) => {
                  const isSelected = filters.status === status.value;
                  return (
                    <TouchableOpacity
                      key={status.value}
                      style={[
                        styles.optionChip,
                        isSelected && {
                          backgroundColor: status.color + '20',
                          borderColor: status.color,
                        },
                      ]}
                      onPress={() => toggleStatus(status.value as FilterOptions['status'])}
                    >
                      {isSelected && (
                        <Check size={16} color={status.color} style={styles.checkIcon} />
                      )}
                      <Text
                        style={[
                          styles.optionText,
                          isSelected && { color: status.color, fontWeight: '600' },
                        ]}
                      >
                        {status.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Category Filter */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Kategori</Text>
              <View style={styles.optionsGrid}>
                {CATEGORIES.map((category) => {
                  const isSelected = filters.category === category.value;
                  return (
                    <TouchableOpacity
                      key={category.value}
                      style={[
                        styles.optionChip,
                        isSelected && styles.optionChipSelected,
                      ]}
                      onPress={() => toggleCategory(category.value)}
                    >
                      {isSelected && (
                        <Check size={16} color={colors.primary} style={styles.checkIcon} />
                      )}
                      <Text
                        style={[
                          styles.optionText,
                          isSelected && styles.optionTextSelected,
                        ]}
                      >
                        {category.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Sort Options */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Sıralama</Text>
              <View style={styles.optionsGrid}>
                {SORT_OPTIONS.map((option) => {
                  const isSelected = filters.sortBy === option.value;
                  return (
                    <TouchableOpacity
                      key={option.value}
                      style={[
                        styles.optionChip,
                        isSelected && styles.optionChipSelected,
                      ]}
                      onPress={() => setSortBy(option.value as FilterOptions['sortBy'])}
                    >
                      {isSelected && (
                        <Check size={16} color={colors.primary} style={styles.checkIcon} />
                      )}
                      <Text
                        style={[
                          styles.optionText,
                          isSelected && styles.optionTextSelected,
                        ]}
                      >
                        {option.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Sort Order Toggle */}
              {filters.sortBy && (
                <View style={styles.sortOrderContainer}>
                  <Text style={styles.sortOrderLabel}>Azalan Sırada</Text>
                  <Switch
                    value={filters.sortOrder === 'desc'}
                    onValueChange={toggleSortOrder}
                    trackColor={{ false: colors.border, true: colors.primary }}
                    thumbColor={colors.surface}
                  />
                </View>
              )}
            </View>

            {/* Show Retired Toggle */}
            <View style={styles.section}>
              <View style={styles.toggleRow}>
                <View>
                  <Text style={styles.sectionTitle}>Kullanım Dışı Ekipmanlar</Text>
                  <Text style={styles.toggleDescription}>
                    Kullanım dışı bırakılmış ekipmanları göster
                  </Text>
                </View>
                <Switch
                  value={filters.showRetired || false}
                  onValueChange={(value) =>
                    setFilters({ ...filters, showRetired: value })
                  }
                  trackColor={{ false: colors.border, true: colors.primary }}
                  thumbColor={colors.surface}
                />
              </View>
            </View>
          </ScrollView>

          {/* Footer */}
          <View style={styles.footer}>
            <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
              <Text style={styles.resetButtonText}>Sıfırla</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.applyButton} onPress={handleApply}>
              <Text style={styles.applyButtonText}>Uygula</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
  },
  content: {
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  optionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  optionChipSelected: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primary,
  },
  checkIcon: {
    marginRight: 4,
  },
  optionText: {
    fontSize: 14,
    color: colors.text,
  },
  optionTextSelected: {
    color: colors.primary,
    fontWeight: '600',
  },
  sortOrderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    padding: 12,
    backgroundColor: colors.surface,
    borderRadius: 8,
  },
  sortOrderLabel: {
    fontSize: 14,
    color: colors.text,
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  toggleDescription: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 4,
  },
  footer: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  resetButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  resetButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  applyButton: {
    flex: 2,
    padding: 16,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: 'center',
  },
  applyButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textOnPrimary,
  },
});
