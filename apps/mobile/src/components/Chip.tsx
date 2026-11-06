import React from 'react';
import { Pressable, Text, View, type ViewStyle } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { Icon } from '../icons';

type Props = {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  style?: ViewStyle;
};

export function Chip({ label, selected = false, onPress, style }: Props) {
  const { theme } = useTheme();

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      style={({ pressed }) => [
        {
          height: 32,
          paddingHorizontal: 12,
          borderRadius: theme.radii.pill,
          backgroundColor: selected
            ? theme.colors.accentSoft
            : pressed
            ? theme.colors.surfaceAlt
            : theme.colors.surface,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 6,
        },
        style,
      ]}
    >
      {selected ? <Icon.Check size={14} color={theme.colors.primaryText} /> : null}
      <Text
        style={{
          color: selected ? theme.colors.primaryText : theme.colors.text,
          fontSize: 13,
          fontWeight: '600',
          lineHeight: 18,
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}
