import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { Screen } from '../components/Screen';
import { Button } from '../components/Button';
import { Icon } from '../icons';

type Props = { onBack: () => void; mode: 'light' | 'dark'; onToggleTheme: () => void; onSignOut: () => void };

export function SettingsScreen({ onBack, mode, onToggleTheme, onSignOut }: Props) {
  const { theme } = useTheme();
  return (
    <Screen>
      <View style={{ gap: theme.spacing(4) }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <Button label="Back" onPress={onBack} variant="ghost" style={{ paddingHorizontal: 16, paddingVertical: 8 }} />
          <Text style={{ color: theme.colors.text, fontSize: theme.fontSizes.lg, fontWeight: '800' }}>Settings</Text>
        </View>
        <Pressable onPress={onToggleTheme} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 16, borderBottomWidth: 2, borderBottomColor: theme.colors.border }}>
          <Text style={{ color: theme.colors.text, fontSize: theme.fontSizes.md }}>Theme: {mode}</Text>
          {mode === 'dark' ? <Icon.Sun /> : <Icon.Moon />}
        </Pressable>
        <Pressable onPress={() => {}} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 16, borderBottomWidth: 2, borderBottomColor: theme.colors.border }}>
          <Text style={{ color: theme.colors.text, fontSize: theme.fontSizes.md }}>Safety & rules</Text>
          <Icon.Next size={18} />
        </Pressable>
        <Pressable onPress={() => {}} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 16, borderBottomWidth: 2, borderBottomColor: theme.colors.border }}>
          <Text style={{ color: theme.colors.text, fontSize: theme.fontSizes.md }}>Privacy</Text>
          <Icon.Next size={18} />
        </Pressable>
        <Button label="Sign out" onPress={onSignOut} variant="ghost" />
      </View>
    </Screen>
  );
}
