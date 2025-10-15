import React from 'react';
import { View, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import Animated, {
  FadeInDown,
  FadeInUp,
  Layout,
} from 'react-native-reanimated';

type CardVariant = 'elevated' | 'outlined' | 'filled';

interface CardProps {
  children: React.ReactNode;
  variant?: CardVariant;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
  animated?: boolean;
  animationDelay?: number;
}

const Card: React.FC<CardProps> = ({
  children,
  variant = 'elevated',
  style,
  onPress,
  animated = false,
  animationDelay = 0,
}) => {
  const getCardStyle = (): ViewStyle => {
    const baseStyle = [styles.card];

    switch (variant) {
      case 'elevated':
        baseStyle.push(styles.cardElevated);
        break;
      case 'outlined':
        baseStyle.push(styles.cardOutlined);
        break;
      case 'filled':
        baseStyle.push(styles.cardFilled);
        break;
    }

    return StyleSheet.flatten(baseStyle);
  };

  if (animated) {
    return (
      <Animated.View
        entering={FadeInUp.delay(animationDelay).springify()}
        layout={Layout.springify()}
        style={[getCardStyle(), style]}
      >
        {children}
      </Animated.View>
    );
  }

  return <View style={[getCardStyle(), style]}>{children}</View>;
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 16,
  },
  cardElevated: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  cardOutlined: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  cardFilled: {
    backgroundColor: '#F9FAFB',
  },
});

export default Card;
