import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { WifiOff, RefreshCw } from 'lucide-react-native';
import { colors } from '../constants/colors';

interface NetworkErrorProps {
  message?: string;
  onRetry?: () => void;
}

export const NetworkError: React.FC<NetworkErrorProps> = ({
  message = 'İnternet bağlantınızı kontrol edin',
  onRetry,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <WifiOff size={48} color={colors.error} />
      </View>
      <Text style={styles.title}>Bağlantı Hatası</Text>
      <Text style={styles.message}>{message}</Text>
      {onRetry && (
        <TouchableOpacity style={styles.button} onPress={onRetry}>
          <RefreshCw size={18} color={colors.textOnPrimary} />
          <Text style={styles.buttonText}>Yeniden Dene</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  iconContainer: {
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  message: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    gap: 8,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textOnPrimary,
  },
});
