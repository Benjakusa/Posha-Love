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
          borderRadius: theme.radii.lg,
          padding: 12,
          backgroundColor: theme.colors.surface,
          gap: 6,
        },
        style,
      ]}
    >
      {title ? (
        <Text style={{ color: theme.colors.text, fontSize: 17, fontWeight: '700', lineHeight: 22 }}>
          {title}
        </Text>
      ) : null}
      {subtitle ? (
        <Text style={{ color: theme.colors.textMuted, fontSize: 13, lineHeight: 18 }}>
          {subtitle}
        </Text>
      ) : null}
      {children}
    </View>
  );

  if (!onPress) return content;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={({ pressed }) => ({
        backgroundColor: pressed ? theme.colors.surfaceAlt : 'transparent',
        borderRadius: theme.radii.lg,
      })}
    >
      {content}
    </Pressable>
  );
}
