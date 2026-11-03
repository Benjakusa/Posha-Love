import React from 'react';
import { Pressable, Text, ActivityIndicator, type ViewStyle } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';

type Props = {
  label: string;
  onPress?: () => void;
  variant?: 'primary' | 'ghost';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
};

export function Button({ label, onPress, variant = 'primary', loading, disabled, style }: Props) {
  const { theme } = useTheme();
  const isPrimary = variant === 'primary';
  const isDisabled = disabled || loading;

  return (
    <Pressable
      onPress={isDisabled ? undefined : onPress}
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      style={({ pressed }) => [
        {
          paddingVertical: 16,
          paddingHorizontal: 24,
          borderRadius: theme.radii.pill,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: isPrimary ? theme.colors.primary : 'transparent',
          borderWidth: isPrimary ? 0 : 2,
          borderColor: theme.colors.border,
          opacity: isDisabled ? 0.4 : pressed ? 0.85 : 1,
          minHeight: 52,
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={isPrimary ? theme.colors.onPrimary : theme.colors.text} />
      ) : (
        <Text
          style={{
            color: isPrimary ? theme.colors.onPrimary : theme.colors.text,
            fontSize: theme.fontSizes.md,
            fontWeight: '700',
          }}
        >
          {label}
        </Text>
      )}
    </Pressable>
  );
}
