import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeProvider';
import { Icon } from '../icons';

export type NavRoute = 'home' | 'explore' | 'profile' | 'settings';

type Props = {
  active: NavRoute;
  onNavigate: (route: NavRoute) => void;
};

export function BottomNav({ active, onNavigate }: Props) {
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
        backgroundColor: theme.colors.bg,
        borderTopWidth: 2,
        borderTopColor: theme.colors.border,
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingTop: 12,
        paddingBottom: Math.max(insets.bottom, 16) + 8,
      }}
    >
      {items.map(({ route, label, Icon: Ico }) => {
        const isActive = route === active;
        const tint = isActive ? theme.colors.primary : theme.colors.icon;
        return (
          <Pressable
            key={route}
            onPress={() => onNavigate?.(route)}
            accessibilityLabel={label}
            accessibilityState={{ selected: isActive }}
            style={{ alignItems: 'center', gap: 4, minWidth: 60 }}
          >
            <Ico size={22} color={tint} />
            <Text style={{ fontSize: 11, color: tint, fontWeight: '700' }}>{label}</Text>
            {isActive ? (
              <View style={{ width: 20, height: 2, backgroundColor: theme.colors.primary, marginTop: 2 }} />
            ) : null}
          </Pressable>
        );
      })}
    </View>
  );
}
