import React from 'react';
import { View, Text, Pressable, type ViewStyle } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';

type Props = {
  title?: string;
  subtitle?: string;
  onPress?: () => void;
  children?: React.ReactNode;
  style?: ViewStyle;
};

export function Card({ title, subtitle, onPress, children, style }: Props) {
  const { theme } = useTheme();
  const content = (
    <View
      style={[
        {
          borderWidth: 2,
          borderColor: theme.colors.border,
          borderRadius: theme.radii.lg,
          padding: theme.spacing(5),
          backgroundColor: theme.colors.surface,
          gap: theme.spacing(2),
        },
        style,
      ]}
    >
      {title ? (
        <Text style={{ color: theme.colors.text, fontSize: theme.fontSizes.lg, fontWeight: '800' }}>
          {title}
        </Text>
      ) : null}
      {subtitle ? (
        <Text style={{ color: theme.colors.text, fontSize: theme.fontSizes.sm }}>{subtitle}</Text>
      ) : null}
      {children}
    </View>
  );
  if (!onPress) return content;
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1 })}
    >
      {content}
    </Pressable>
  );
}
