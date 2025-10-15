import React from 'react';
import { View, Image, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';

type AvatarSize = 'small' | 'medium' | 'large' | 'xlarge';

interface AvatarProps {
  source?: string;
  name?: string;
  size?: AvatarSize;
  style?: ViewStyle;
  icon?: keyof typeof Ionicons.glyphMap;
  badge?: boolean;
  badgeColor?: string;
}

const Avatar: React.FC<AvatarProps> = ({
  source,
  name,
  size = 'medium',
  style,
  icon,
  badge = false,
  badgeColor = '#10B981',
}) => {
  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return { width: 32, height: 32, borderRadius: 16 };
      case 'medium':
        return { width: 40, height: 40, borderRadius: 20 };
      case 'large':
        return { width: 56, height: 56, borderRadius: 28 };
      case 'xlarge':
        return { width: 80, height: 80, borderRadius: 40 };
    }
  };

  const getIconSize = () => {
    switch (size) {
      case 'small':
        return 16;
      case 'medium':
        return 20;
      case 'large':
        return 28;
      case 'xlarge':
        return 40;
    }
  };

  const getFontSize = () => {
    switch (size) {
      case 'small':
        return 14;
      case 'medium':
        return 16;
      case 'large':
        return 20;
      case 'xlarge':
        return 28;
    }
  };

  const getBadgeSize = () => {
    switch (size) {
      case 'small':
        return 8;
      case 'medium':
        return 10;
      case 'large':
        return 12;
      case 'xlarge':
        return 16;
    }
  };

  const getInitials = (name: string): string => {
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const sizeStyles = getSizeStyles();

  return (
    <Animated.View entering={FadeIn.duration(300)} style={[styles.container, style]}>
      <View style={[styles.avatar, sizeStyles]}>
        {source ? (
          <Image
            source={{ uri: source }}
            style={[styles.image, sizeStyles]}
            resizeMode="cover"
          />
        ) : icon ? (
          <View style={[styles.iconContainer, sizeStyles]}>
            <Ionicons name={icon} size={getIconSize()} color="#6B7280" />
          </View>
        ) : name ? (
          <View style={[styles.initialsContainer, sizeStyles]}>
            <Text style={[styles.initials, { fontSize: getFontSize() }]}>
              {getInitials(name)}
            </Text>
          </View>
        ) : (
          <View style={[styles.iconContainer, sizeStyles]}>
            <Ionicons name="person" size={getIconSize()} color="#6B7280" />
          </View>
        )}
      </View>
      {badge && (
        <View
          style={[
            styles.badge,
            {
              width: getBadgeSize(),
              height: getBadgeSize(),
              borderRadius: getBadgeSize() / 2,
              backgroundColor: badgeColor,
            },
          ]}
        />
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  avatar: {
    overflow: 'hidden',
    backgroundColor: '#F3F4F6',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#E5E7EB',
  },
  initialsContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#3B82F6',
  },
  initials: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  badge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
});

export default Avatar;
