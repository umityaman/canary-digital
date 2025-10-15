import React from 'react';
import { Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

type BadgeVariant = 'success' | 'warning' | 'error' | 'info' | 'default';
type BadgeSize = 'small' | 'medium' | 'large';

interface BadgeProps {
  children: string;
  variant?: BadgeVariant;
  size?: BadgeSize;
  style?: ViewStyle;
  textStyle?: TextStyle;
  animated?: boolean;
}

const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'medium',
  style,
  textStyle,
  animated = false,
}) => {
  const getBadgeStyle = (): ViewStyle => {
    const baseStyle = [styles.badge, styles[`badge_${size}`]];

    switch (variant) {
      case 'success':
        baseStyle.push(styles.badgeSuccess);
        break;
      case 'warning':
        baseStyle.push(styles.badgeWarning);
        break;
      case 'error':
        baseStyle.push(styles.badgeError);
        break;
      case 'info':
        baseStyle.push(styles.badgeInfo);
        break;
      case 'default':
        baseStyle.push(styles.badgeDefault);
        break;
    }

    return StyleSheet.flatten(baseStyle);
  };

  const getTextStyle = (): TextStyle => {
    const baseStyle = [styles.badgeText, styles[`badgeText_${size}`]];

    switch (variant) {
      case 'success':
        baseStyle.push(styles.badgeTextSuccess);
        break;
      case 'warning':
        baseStyle.push(styles.badgeTextWarning);
        break;
      case 'error':
        baseStyle.push(styles.badgeTextError);
        break;
      case 'info':
        baseStyle.push(styles.badgeTextInfo);
        break;
      case 'default':
        baseStyle.push(styles.badgeTextDefault);
        break;
    }

    return StyleSheet.flatten(baseStyle);
  };

  if (animated) {
    return (
      <Animated.View entering={FadeIn.duration(300)} style={[getBadgeStyle(), style]}>
        <Text style={[getTextStyle(), textStyle]}>{children}</Text>
      </Animated.View>
    );
  }

  return (
    <Animated.View style={[getBadgeStyle(), style]}>
      <Text style={[getTextStyle(), textStyle]}>{children}</Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  badge_small: {
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  badge_medium: {
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  badge_large: {
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  badgeSuccess: {
    backgroundColor: '#D1FAE5',
  },
  badgeWarning: {
    backgroundColor: '#FEF3C7',
  },
  badgeError: {
    backgroundColor: '#FEE2E2',
  },
  badgeInfo: {
    backgroundColor: '#DBEAFE',
  },
  badgeDefault: {
    backgroundColor: '#F3F4F6',
  },
  badgeText: {
    fontWeight: '600',
  },
  badgeText_small: {
    fontSize: 11,
    lineHeight: 16,
  },
  badgeText_medium: {
    fontSize: 12,
    lineHeight: 18,
  },
  badgeText_large: {
    fontSize: 14,
    lineHeight: 20,
  },
  badgeTextSuccess: {
    color: '#047857',
  },
  badgeTextWarning: {
    color: '#B45309',
  },
  badgeTextError: {
    color: '#DC2626',
  },
  badgeTextInfo: {
    color: '#1D4ED8',
  },
  badgeTextDefault: {
    color: '#4B5563',
  },
});

export default Badge;
