import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeProvider';
import { Icon } from '../icons';

type Props = {
  title?: string;
  onBack: () => void;
  rightActionLabel?: string;
  onRightAction?: () => void;
};

export function BackBar({ title, onBack, rightActionLabel, onRightAction }: Props) {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={{
        paddingTop: insets.top,
        height: 52 + insets.top,
        backgroundColor: theme.colors.bg,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 }}>
        <Pressable
          onPress={onBack}
          accessibilityLabel="Back"
          style={({ pressed }) => ({
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: pressed ? theme.colors.surfaceAlt : theme.colors.surface,
            alignItems: 'center',
            justifyContent: 'center',
          })}
        >
          <Icon.Back size={20} color={theme.colors.text} />
        </Pressable>

        {title ? (
          <Text
            numberOfLines={1}
            style={{
              color: theme.colors.text,
              fontSize: 20,
              fontWeight: '700',
              lineHeight: 24,
              flex: 1,
            }}
          >
            {title}
          </Text>
        ) : null}
      </View>

      {rightActionLabel && onRightAction ? (
        <Pressable onPress={onRightAction}>
          <Text style={{ color: theme.colors.primaryText, fontSize: 15, fontWeight: '600' }}>
            {rightActionLabel}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}
