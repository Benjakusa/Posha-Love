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
  onEditProfile?: () => void;
  onNotifications?: () => void;
  onPrivacy?: () => void;
  onTerms?: () => void;
  onReport?: () => void;
  onHelp?: () => void;
};

export function SettingsScreen({
  onBack, mode, onToggleTheme, onSignOut,
  onEditProfile, onNotifications, onPrivacy, onTerms, onReport, onHelp,
}: Props) {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();

  const SectionHeader = ({ children }: { children: string }) => (
    <Text style={{
      color: theme.colors.textMuted,
      fontSize: 12,
      fontWeight: '900',
      letterSpacing: 1.2,
      textTransform: 'uppercase',
      paddingHorizontal: 20,
      paddingTop: 24,
      paddingBottom: 8,
    }}>
      {children}
    </Text>
  );

  const Row = ({
    icon, label, onPress, right, danger,
  }: {
    icon: React.ReactNode;
    label: string;
    onPress?: () => void;
    right?: React.ReactNode;
    danger?: boolean;
  }) => (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
        paddingHorizontal: 20,
        gap: 16,
        backgroundColor: pressed ? (theme.mode === 'light' ? '#F5F6F8' : theme.colors.surface) : 'transparent',
      })}
    >
      <View style={[
        { width: 32, height: 32, borderRadius: 16, backgroundColor: theme.mode === 'light' ? '#FFFFFF' : theme.colors.surface, alignItems: 'center', justifyContent: 'center' },
        {
          shadowColor: theme.mode === 'light' ? '#000000' : '#FFFFFF',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: theme.mode === 'light' ? 0.06 : 0.10,
          shadowRadius: 6,
          elevation: theme.mode === 'light' ? 2 : 0,
        },
      ]}>
        {icon}
      </View>
      <Text style={{ flex: 1, color: danger ? theme.colors.danger : theme.colors.text, fontSize: 15, fontWeight: '500' }}>
        {label}
      </Text>
      {right ?? <Icon.Next size={16} color={theme.colors.textMuted} />}
    </Pressable>
  );

  const Divider = () => (
    <View style={{ height: 1, backgroundColor: theme.mode === 'light' ? '#E5E7EB' : theme.colors.border, marginLeft: 64, opacity: 0.5 }} />
  );

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.bg }}>
      {/* Header */}
      <View style={{
        paddingTop: insets.top + 12, paddingBottom: 12, paddingHorizontal: 16,
        flexDirection: 'row', alignItems: 'center', gap: 12,
        borderBottomWidth: 1, borderBottomColor: theme.mode === 'light' ? '#E5E7EB' : theme.colors.border,
      }}>
        <Pressable onPress={onBack} accessibilityLabel="Back">
          <Icon.Back size={24} color={theme.colors.text} />
        </Pressable>
        <Text style={{ color: theme.colors.text, fontSize: 18, fontWeight: '900' }}>Settings</Text>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        {/* Account */}
        <SectionHeader>Account</SectionHeader>
        <Row icon={<Icon.User size={22} color={theme.colors.primary} />} label="Edit profile" onPress={onEditProfile} />
        <Divider />
        <Row icon={<Icon.Bell size={22} color={theme.colors.primary} />} label="Notifications" onPress={onNotifications} />

        {/* Preferences */}
        <SectionHeader>Preferences</SectionHeader>
        <Row
          icon={mode === 'dark' ? <Icon.Moon size={22} color={theme.colors.primary} /> : <Icon.Sun size={22} color={theme.colors.primary} />}
          label={mode === 'dark' ? 'Dark mode' : 'Light mode'}
          right={
            <Switch
              value={mode === 'dark'}
              onValueChange={onToggleTheme}
              trackColor={{ true: theme.colors.primary, false: theme.colors.border }}
              thumbColor="#FFFFFF"
            />
          }
        />

        {/* Safety & privacy */}
        <SectionHeader>Safety & privacy</SectionHeader>
        <Row icon={<Icon.Lock size={22} color={theme.colors.primary} />} label="Privacy" onPress={onPrivacy} />
        <Divider />
        <Row icon={<Icon.Check size={22} color={theme.colors.primary} />} label="Terms of service" onPress={onTerms} />
        <Divider />
        <Row icon={<Icon.Bell size={22} color={theme.colors.primary} />} label="Report a problem" onPress={onReport} />

        {/* Support */}
        <SectionHeader>Support</SectionHeader>
        <Row icon={<Icon.Chat size={22} color={theme.colors.primary} />} label="Help center" onPress={onHelp} />
        <Divider />
        <Row
          icon={<Icon.Explore size={22} color={theme.colors.primary} />}
          label="Version"
          right={<Text style={{ color: theme.colors.textMuted, fontSize: 13 }}>1.0.0</Text>}
        />

        {/* Sign out */}
        <SectionHeader>Account</SectionHeader>
        <Row
          icon={<Icon.Close size={22} color={theme.colors.danger} />}
          label="Sign out"
          onPress={onSignOut}
          danger
        />
      </ScrollView>
    </View>
  );
}
