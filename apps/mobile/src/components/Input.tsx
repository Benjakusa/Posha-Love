import React, { useState } from 'react';
import { View, Text, TextInput, type TextInputProps, type ViewStyle } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { Icon } from '../icons';

type Props = {
  label?: string;
  error?: string | null;
  containerStyle?: ViewStyle;
} & TextInputProps;

export function Input({
  label,
  error,
  multiline,
  containerStyle,
  style,
  onFocus,
  onBlur,
  ...rest
}: Props) {
  const { theme } = useTheme();
  const [focused, setFocused] = useState(false);

  return (
    <View style={[{ gap: 6 }, containerStyle]}>
      {label ? (
        <Text style={{ color: theme.colors.textMuted, fontSize: 13, fontWeight: '600', lineHeight: 18 }}>
          {label}
        </Text>
      ) : null}

      <TextInput
        multiline={multiline}
        onFocus={(e) => {
          setFocused(true);
          onFocus?.(e);
        }}
        onBlur={(e) => {
          setFocused(false);
          onBlur?.(e);
        }}
        placeholderTextColor={theme.colors.textMuted}
        style={[
          {
            minHeight: multiline ? 90 : 44,
            borderRadius: multiline ? theme.radii.md : theme.radii.pill,
            backgroundColor: theme.mode === 'light' ? '#F5F6F8' : theme.colors.surface,
            borderWidth: focused ? 1.5 : 0,
            borderColor: focused ? theme.colors.primary : theme.colors.border,
            paddingHorizontal: 16,
            paddingVertical: multiline ? 12 : 10,
            color: theme.colors.text,
            fontSize: 15,
            lineHeight: 21,
          },
          style,
        ]}
        {...rest}
      />

      {error ? (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 }}>
          <Icon.Warning size={14} color={theme.colors.danger} />
          <Text style={{ color: theme.colors.danger, fontSize: 13, lineHeight: 18, flex: 1 }}>
            {error}
          </Text>
        </View>
      ) : null}
    </View>
  );
}
