import React from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { colors } from '../constants/colors';

interface LoadingSkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: any;
}

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({
  width = '100%',
  height = 20,
  borderRadius = 4,
  style,
}) => {
  const animatedValue = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [animatedValue]);

  const opacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <Animated.View
      style={[
        styles.skeleton,
        {
          width,
          height,
          borderRadius,
          opacity,
        },
        style,
      ]}
    />
  );
};

export const EquipmentCardSkeleton = () => {
  return (
    <View style={styles.cardContainer}>
      <LoadingSkeleton width={80} height={80} borderRadius={8} />
      <View style={styles.cardContent}>
        <LoadingSkeleton width="60%" height={18} borderRadius={4} />
        <View style={styles.spacing} />
        <LoadingSkeleton width="40%" height={14} borderRadius={4} />
        <View style={styles.spacing} />
        <LoadingSkeleton width={80} height={24} borderRadius={12} />
      </View>
    </View>
  );
};

export const ListSkeleton = ({ count = 5 }: { count?: number }) => {
  return (
    <View style={styles.listContainer}>
      {Array.from({ length: count }).map((_, index) => (
        <EquipmentCardSkeleton key={index} />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: colors.border,
  },
  cardContainer: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  cardContent: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  spacing: {
    height: 8,
  },
  listContainer: {
    padding: 16,
  },
});
