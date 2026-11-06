import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeProvider';
import { Icon } from '../icons';

export type NavRoute = 'home' | 'explore' | 'profile' | 'settings';

type Props = {
  active: NavRoute;
  onNavigate: (route: NavRoute) => void;
  hasNotifDot?: boolean;
};

export function BottomNav({ active, onNavigate, hasNotifDot }: Props) {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();

  const items = [
    { route: 'home' as const, label: 'Home', Icon: Icon.Home },
    { route: 'explore' as const, label: 'Explore', Icon: Icon.Explore },
    { route: 'profile' as const, label: 'Profile', Icon: Icon.User },
    { route: 'settings' as const, label: 'Settings', Icon: Icon.Settings },
  ];

  return (
    <View
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        height: 56 + insets.bottom,
        backgroundColor: theme.colors.bg,
        borderTopWidth: 1,
        borderTopColor: theme.colors.border,
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'flex-start',
        paddingTop: 6,
        paddingBottom: insets.bottom,
      }}
    >
      {items.map(({ route, label, Icon: Ico }) => {
        const isActive = route === active;
        const tint = isActive ? theme.colors.iconActive : theme.colors.icon;

        return (
          <Pressable
            key={route}
            onPress={() => onNavigate?.(route)}
            accessibilityLabel={label}
            accessibilityState={{ selected: isActive }}
            style={{ alignItems: 'center', justifyContent: 'center', minWidth: 60 }}
          >
            {({ pressed }) => (
              <View style={{ alignItems: 'center', gap: 2 }}>
                <View
                  style={{
                    width: 44,
                    height: 32,
                    borderRadius: 22,
                    backgroundColor: pressed ? theme.colors.surfaceAlt : 'transparent',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Ico size={24} color={tint} />
                  {hasNotifDot && route === 'settings' ? (
                    <View
                      style={{
                        position: 'absolute',
                        top: 4,
                        right: 8,
                        width: 8,
                        height: 8,
                        borderRadius: 4,
                        backgroundColor: theme.colors.primary,
                      }}
                    />
                  ) : null}
                </View>

                <Text style={{ fontSize: 11, fontWeight: '500', color: tint, lineHeight: 14 }}>
                  {label}
                </Text>
              </View>
            )}
          </Pressable>
        );
      })}
    </View>
  );
}
