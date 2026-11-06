import React from 'react';
import { Pressable, Text, ActivityIndicator, type ViewStyle } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';

type Props = {
  label: string;
  onPress?: () => void;
  variant?: 'primary' | 'secondary' | 'tertiary' | 'destructive' | 'ghost';
  loading?: boolean;
  disabled?: boolean;
  minHeight?: number;
  style?: ViewStyle;
};

export function Button({
  label,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  minHeight = 44,
  style,
}: Props) {
  const { theme } = useTheme();
  const isDisabled = disabled || loading;

  const bg = (() => {
    switch (variant) {
      case 'primary':
        return theme.colors.primary;
      case 'secondary':
        return theme.colors.accentSoft;
      case 'destructive':
        return theme.colors.surface;
      case 'tertiary':
      case 'ghost':
      default:
        return 'transparent';
    }
  })();

  const pressedBg = (() => {
    switch (variant) {
      case 'primary':
        return theme.colors.primaryPressed;
      case 'secondary':
      case 'destructive':
      case 'tertiary':
      case 'ghost':
      default:
        return theme.colors.surfaceAlt;
    }
  })();

  const textColor = (() => {
    switch (variant) {
      case 'primary':
        return theme.colors.onPrimary;
      case 'secondary':
      case 'tertiary':
        return theme.colors.primaryText;
      case 'destructive':
        return theme.colors.danger;
      case 'ghost':
      default:
        return theme.colors.text;
    }
  })();

  const fontSize = variant === 'tertiary' ? 15 : 16;

  return (
    <Pressable
      onPress={isDisabled ? undefined : onPress}
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      style={({ pressed }) => [
        {
          minHeight,
          paddingVertical: 12,
          paddingHorizontal: 20,
          borderRadius: theme.radii.pill,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: pressed && !isDisabled ? pressedBg : bg,
          opacity: isDisabled ? 0.4 : 1,
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={textColor} />
      ) : (
        <Text
          style={{
            color: textColor,
            fontSize,
            fontWeight: '600',
            lineHeight: 20,
          }}
        >
          {label}
        </Text>
      )}
    </Pressable>
  );
}
