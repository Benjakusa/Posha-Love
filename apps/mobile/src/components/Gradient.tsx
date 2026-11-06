import React from 'react';
import { View, StyleSheet, type ViewStyle } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';

type Props = {
  children?: React.ReactNode;
  style?: ViewStyle;
  fromColor?: string;
  toColor?: string;
};

export function GradientView({ children, style, fromColor, toColor }: Props) {
  const { theme } = useTheme();
  // Gradients are prohibited - use solid accent color instead
  const color = fromColor ?? theme.colors.accent ?? '#FF0000';

  return (
    <View style={[{ overflow: 'hidden' }, style]}>      
      <View style={[{ width: '100%', height: '100%', backgroundColor: color }]}>      
        {children}
      </View>
    </View>
  );
}
