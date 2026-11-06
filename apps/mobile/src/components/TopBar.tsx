import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeProvider';
import { Icon } from '../icons';

type Props = {
  title?: string;
  onSearchPress?: () => void;
  onNotifPress?: () => void;
  notifCount?: number;
};

export function TopBar({ title, onSearchPress, onNotifPress, notifCount = 0 }: Props) {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={{
        paddingTop: insets.top,
        height: 56 + insets.top,
        backgroundColor: theme.colors.bg,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
      }}
    >
      {/* Left: posha wordmark or title */}
      {title ? (
        <Text style={{ color: theme.colors.text, fontSize: 20, fontWeight: '700', lineHeight: 24 }}>
          {title}
        </Text>
      ) : (
        <Text
          style={{
            color: theme.colors.primary,
            fontSize: 24,
            fontWeight: '700',
            lineHeight: 28,
            letterSpacing: -0.5,
          }}
        >
          posha
        </Text>
      )}

      {/* Right: action buttons */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        {onSearchPress ? (
          <Pressable
            onPress={onSearchPress}
            accessibilityLabel="Search"
            style={({ pressed }) => ({
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: pressed ? theme.colors.surfaceAlt : theme.colors.surface,
              alignItems: 'center',
              justifyContent: 'center',
            })}
          >
            <Icon.Explore size={20} color={theme.colors.icon} />
          </Pressable>
        ) : null}

        {onNotifPress ? (
          <Pressable
            onPress={onNotifPress}
            accessibilityLabel="Notifications"
            style={({ pressed }) => ({
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: pressed ? theme.colors.surfaceAlt : theme.colors.surface,
              alignItems: 'center',
              justifyContent: 'center',
            })}
          >
            <Icon.Bell size={20} color={theme.colors.icon} />
            {notifCount > 0 ? (
              <View
                style={{
                  position: 'absolute',
                  top: -2,
                  right: -2,
                  minWidth: 16,
                  height: 16,
                  borderRadius: 8,
                  backgroundColor: theme.colors.primary,
                  alignItems: 'center',
                  justifyContent: 'center',
                  paddingHorizontal: 3,
                }}
              >
                <Text style={{ color: theme.colors.onPrimary, fontSize: 11, fontWeight: '600' }}>
                  {notifCount > 9 ? '9+' : notifCount}
                </Text>
              </View>
            ) : null}
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}
