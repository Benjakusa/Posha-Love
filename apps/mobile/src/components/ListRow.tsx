import React from 'react';
import { View, Text, Pressable, type ViewStyle } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { Icon } from '../icons';

type Props = {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  rightAction?: React.ReactNode;
  showChevron?: boolean;
  showDivider?: boolean;
  onPress?: () => void;
  style?: ViewStyle;
};

export function ListRow({
  title,
  subtitle,
  icon,
  rightAction,
  showChevron = true,
  showDivider = true,
  onPress,
  style,
}: Props) {
  const { theme } = useTheme();

  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress && !rightAction}
      style={({ pressed }) => [
        {
          minHeight: 56,
          paddingVertical: 12,
          paddingHorizontal: 16,
          backgroundColor: pressed && onPress ? theme.colors.surfaceAlt : 'transparent',
          flexDirection: 'row',
          alignItems: 'center',
          gap: 12,
        },
        style,
      ]}
    >
      {icon ? (
        <View
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: theme.colors.surface,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {icon}
        </View>
      ) : null}

      <View style={{ flex: 1, gap: 2 }}>
        <Text style={{ color: theme.colors.text, fontSize: 15, fontWeight: '600', lineHeight: 20 }}>
          {title}
        </Text>
        {subtitle ? (
          <Text style={{ color: theme.colors.textMuted, fontSize: 13, lineHeight: 18 }}>
            {subtitle}
          </Text>
        ) : null}
      </View>

      {rightAction ? (
        rightAction
      ) : showChevron && onPress ? (
        <Icon.Next size={18} color={theme.colors.textMuted} />
      ) : null}

      {showDivider ? (
        <View
          style={{
            position: 'absolute',
            bottom: 0,
            left: icon ? 68 : 16,
            right: 0,
            height: 1,
            backgroundColor: theme.colors.divider,
          }}
        />
      ) : null}
    </Pressable>
  );
}
