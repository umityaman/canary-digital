import React, { useState, useEffect } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Search, X } from 'lucide-react-native';
import { colors } from '../constants/colors';

interface SearchBarProps {
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  onClear?: () => void;
  autoFocus?: boolean;
  loading?: boolean;
  debounceMs?: number;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  placeholder = 'Ara...',
  value,
  onChangeText,
  onClear,
  autoFocus = false,
  loading = false,
  debounceMs = 300,
}) => {
  const [localValue, setLocalValue] = useState(value);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (localValue !== value) {
        onChangeText(localValue);
      }
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [localValue, debounceMs, onChangeText, value]);

  const handleClear = () => {
    setLocalValue('');
    onChangeText('');
    onClear?.();
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchIcon}>
        <Search size={20} color={colors.textSecondary} />
      </View>
      
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor={colors.textSecondary}
        value={localValue}
        onChangeText={setLocalValue}
        autoFocus={autoFocus}
        autoCapitalize="none"
        autoCorrect={false}
        returnKeyType="search"
      />

      {loading && (
        <View style={styles.rightIcon}>
          <ActivityIndicator size="small" color={colors.primary} />
        </View>
      )}

      {!loading && localValue.length > 0 && (
        <TouchableOpacity style={styles.rightIcon} onPress={handleClear}>
          <X size={20} color={colors.textSecondary} />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
    padding: 0,
  },
  rightIcon: {
    marginLeft: 8,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
