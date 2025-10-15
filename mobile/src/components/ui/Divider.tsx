import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';

type DividerOrientation = 'horizontal' | 'vertical';

interface DividerProps {
  orientation?: DividerOrientation;
  style?: ViewStyle;
  thickness?: number;
  color?: string;
  spacing?: number;
}

const Divider: React.FC<DividerProps> = ({
  orientation = 'horizontal',
  style,
  thickness = 1,
  color = '#E5E7EB',
  spacing = 16,
}) => {
  const dividerStyle: ViewStyle =
    orientation === 'horizontal'
      ? {
          height: thickness,
          width: '100%',
          backgroundColor: color,
          marginVertical: spacing,
        }
      : {
          width: thickness,
          height: '100%',
          backgroundColor: color,
          marginHorizontal: spacing,
        };

  return <View style={[dividerStyle, style]} />;
};

export default Divider;
