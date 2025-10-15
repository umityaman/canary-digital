import React from 'react';
import { Text, StyleSheet, ViewStyle, TextStyle, TouchableOpacity } from 'react-native';
import Animated, { FadeIn, FadeOut, Layout } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

type ChipVariant = 'filled' | 'outlined' | 'default';
type ChipSize = 'small' | 'medium';

interface ChipProps {
  label: string;
  variant?: ChipVariant;
  size?: ChipSize;
  selected?: boolean;
  onPress?: () => void;
  onDelete?: () => void;
  icon?: keyof typeof Ionicons.glyphMap;
  style?: ViewStyle;
  textStyle?: TextStyle;
  disabled?: boolean;
}

const Chip: React.FC<ChipProps> = ({
  label,
  variant = 'default',
  size = 'medium',
  selected = false,
  onPress,
  onDelete,
  icon,
  style,
  textStyle,
  disabled = false,
}) => {
  const handlePress = () => {
    if (!disabled && onPress) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onPress();
    }
  };

  const handleDelete = () => {
    if (!disabled && onDelete) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      onDelete();
    }
  };

  const getChipStyle = (): ViewStyle => {
    const baseStyle = [styles.chip, styles[`chip_${size}`]];

    if (selected) {
      baseStyle.push(styles.chipSelected);
    } else {
      switch (variant) {
        case 'filled':
          baseStyle.push(styles.chipFilled);
          break;
        case 'outlined':
          baseStyle.push(styles.chipOutlined);
          break;
        case 'default':
          baseStyle.push(styles.chipDefault);
          break;
      }
    }

    if (disabled) {
      baseStyle.push(styles.chipDisabled);
    }

    return StyleSheet.flatten(baseStyle);
  };

  const getTextStyle = (): TextStyle => {
    const baseStyle = [styles.chipText, styles[`chipText_${size}`]];

    if (selected) {
      baseStyle.push(styles.chipTextSelected);
    } else if (variant === 'outlined') {
      baseStyle.push(styles.chipTextOutlined);
    } else {
      baseStyle.push(styles.chipTextDefault);
    }

    if (disabled) {
      baseStyle.push(styles.chipTextDisabled);
    }

    return StyleSheet.flatten(baseStyle);
  };

  const getIconColor = (): string => {
    if (disabled) return '#9CA3AF';
    if (selected) return '#FFFFFF';
    if (variant === 'outlined') return '#3B82F6';
    return '#6B7280';
  };

  const iconSize = size === 'small' ? 14 : 16;

  const ChipContent = (
    <>
      {icon && (
        <Ionicons
          name={icon}
          size={iconSize}
          color={getIconColor()}
          style={styles.iconLeft}
        />
      )}
      <Text style={[getTextStyle(), textStyle]}>{label}</Text>
      {onDelete && (
        <TouchableOpacity
          onPress={handleDelete}
          disabled={disabled}
          style={styles.deleteButton}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons
            name="close-circle"
            size={iconSize}
            color={getIconColor()}
          />
        </TouchableOpacity>
      )}
    </>
  );

  if (onPress) {
    return (
      <Animated.View
        entering={FadeIn.duration(200)}
        exiting={FadeOut.duration(200)}
        layout={Layout.springify()}
      >
        <TouchableOpacity
          onPress={handlePress}
          disabled={disabled}
          style={[getChipStyle(), style]}
          activeOpacity={0.7}
        >
          {ChipContent}
        </TouchableOpacity>
      </Animated.View>
    );
  }

  return (
    <Animated.View
      entering={FadeIn.duration(200)}
      exiting={FadeOut.duration(200)}
      layout={Layout.springify()}
      style={[getChipStyle(), style]}
    >
      {ChipContent}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: 'flex-start',
  },
  chip_small: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  chip_medium: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  chipDefault: {
    backgroundColor: '#F3F4F6',
  },
  chipFilled: {
    backgroundColor: '#3B82F6',
  },
  chipOutlined: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#3B82F6',
  },
  chipSelected: {
    backgroundColor: '#3B82F6',
  },
  chipDisabled: {
    opacity: 0.5,
  },
  chipText: {
    fontWeight: '500',
  },
  chipText_small: {
    fontSize: 12,
    lineHeight: 16,
  },
  chipText_medium: {
    fontSize: 13,
    lineHeight: 18,
  },
  chipTextDefault: {
    color: '#374151',
  },
  chipTextOutlined: {
    color: '#3B82F6',
  },
  chipTextSelected: {
    color: '#FFFFFF',
  },
  chipTextDisabled: {
    color: '#9CA3AF',
  },
  iconLeft: {
    marginRight: 4,
  },
  deleteButton: {
    marginLeft: 4,
  },
});

export default Chip;
