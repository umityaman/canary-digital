import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { FileQuestion } from 'lucide-react-native';
import { colors } from '../constants/colors';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  message?: string;
  action?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  message,
  action,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        {icon || <FileQuestion size={64} color={colors.textSecondary} />}
      </View>
      <Text style={styles.title}>{title}</Text>
      {message && <Text style={styles.message}>{message}</Text>}
      {action && <View style={styles.action}>{action}</View>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  iconContainer: {
    marginBottom: 20,
    opacity: 0.5,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  message: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  action: {
    marginTop: 12,
  },
});
