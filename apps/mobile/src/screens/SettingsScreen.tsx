import React from 'react';
import { View, Text, ScrollView, Pressable, Switch } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeProvider';
import { Icon } from '../icons';

type Props = {
  onBack: () => void;
  mode: string;
  onToggleTheme: () => void;
  onSignOut: () => void;
};

export function SettingsScreen({ onBack, mode, onToggleTheme, onSignOut }: Props) {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();

  const sectionTitle = (t: string) => (
    <Text style={{
      color: theme.colors.text, fontSize: 13, fontWeight: '900',
      letterSpacing: 1, textTransform: 'uppercase',
      opacity: 0.6, marginTop: 20, marginBottom: 8,
    }}>{t}</Text>
  );

  const row = (label: string, onPress?: () => void, right?: React.ReactNode) => (
    <Pressable
      onPress={onPress}
      style={{
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: 16, paddingVertical: 14,
        borderWidth: 2, borderColor: theme.colors.border,
        borderRadius: theme.radii.md, marginBottom: 8,
      }}
    >
      <Text style={{ color: theme.colors.text, fontSize: 14, fontWeight: '700' }}>{label}</Text>
      {right ?? <Icon.Next size={16} color={theme.colors.text} />}
    </Pressable>
  );

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.bg }}>
      {/* Header */}
      <View style={{
        paddingTop: insets.top + 12, paddingBottom: 12, paddingHorizontal: 16,
        flexDirection: 'row', alignItems: 'center', gap: 12,
        borderBottomWidth: 2, borderBottomColor: theme.colors.border,
      }}>
        <Pressable onPress={onBack} accessibilityLabel="Back">
          <Icon.Back size={26} color={theme.colors.text} />
        </Pressable>
        <Text style={{ color: theme.colors.text, fontSize: 16, fontWeight: '800' }}>Settings</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        {sectionTitle('Appearance')}
        <View style={{
          flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
          paddingHorizontal: 16, paddingVertical: 14,
          borderWidth: 2, borderColor: theme.colors.border,
          borderRadius: theme.radii.md,
        }}>
          <Text style={{ color: theme.colors.text, fontSize: 14, fontWeight: '700' }}>Dark mode</Text>
          <Switch
            value={mode === 'dark'}
            onValueChange={onToggleTheme}
            trackColor={{ true: theme.colors.primary, false: theme.colors.border }}
            thumbColor="#FFFFFF"
          />
        </View>

        {sectionTitle('Safety')}
        {row('Safety & rules')}
        {row('Report a problem')}
        {row('Blocked accounts')}

        {sectionTitle('Privacy')}
        {row('Privacy policy')}
        {row('Terms of service')}
        {row('Data & downloads')}

        {sectionTitle('About')}
        {row('POSHA version', undefined, <Text style={{ color: theme.colors.text, fontSize: 13, opacity: 0.6 }}>1.0.0</Text>)}

        <View style={{ marginTop: 24 }}>
          <Pressable
            onPress={onSignOut}
            style={{
              borderWidth: 2, borderColor: theme.colors.danger,
              borderRadius: 999, paddingVertical: 14, alignItems: 'center',
            }}
          >
            <Text style={{ color: theme.colors.danger, fontWeight: '900', fontSize: 14 }}>Sign out</Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}
