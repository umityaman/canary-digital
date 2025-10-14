import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { X } from 'lucide-react-native';
import { colors } from '../constants/colors';

export interface FilterOption {
  id: string;
  label: string;
  value: any;
  type: 'chip' | 'range' | 'date';
}

interface FilterChipsProps {
  filters: FilterOption[];
  onRemove: (filterId: string) => void;
  onClearAll?: () => void;
}

export const FilterChips: React.FC<FilterChipsProps> = ({
  filters,
  onRemove,
  onClearAll,
}) => {
  if (filters.length === 0) {
    return null;
  }

  const getFilterLabel = (filter: FilterOption): string => {
    switch (filter.type) {
      case 'range':
        return `${filter.label}: ${filter.value.min} - ${filter.value.max}`;
      case 'date':
        return `${filter.label}: ${new Date(filter.value).toLocaleDateString('tr-TR')}`;
      default:
        return `${filter.label}: ${filter.value}`;
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {filters.map((filter) => (
          <View key={filter.id} style={styles.chip}>
            <Text style={styles.chipText}>{getFilterLabel(filter)}</Text>
            <TouchableOpacity
              style={styles.removeButton}
              onPress={() => onRemove(filter.id)}
            >
              <X size={14} color={colors.primary} />
            </TouchableOpacity>
          </View>
        ))}
        
        {filters.length > 1 && onClearAll && (
          <TouchableOpacity style={styles.clearAllButton} onPress={onClearAll}>
            <Text style={styles.clearAllText}>Tümünü Temizle</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  scrollContent: {
    paddingHorizontal: 2,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primaryLight,
    borderRadius: 20,
    paddingVertical: 6,
    paddingLeft: 12,
    paddingRight: 6,
    marginRight: 8,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  chipText: {
    fontSize: 13,
    color: colors.primary,
    fontWeight: '500',
    marginRight: 4,
  },
  removeButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  clearAllButton: {
    backgroundColor: colors.error + '20',
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: colors.error,
  },
  clearAllText: {
    fontSize: 13,
    color: colors.error,
    fontWeight: '500',
  },
});
