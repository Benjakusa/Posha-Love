import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, Switch } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeProvider';
import { Icon } from '../icons';

type Props = { onBack: () => void };

export function NotificationsScreen({ onBack }: Props) {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const [chat, setChat] = useState(true);
  const [comments, setComments] = useState(true);
  const [lives, setLives] = useState(true);
  const [subs, setSubs] = useState(true);
  const [marketing, setMarketing] = useState(false);

  const row = (label: string, value: boolean, onChange: (v: boolean) => void) => (
    <View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 20, gap: 16 }}>
      <Text style={{ flex: 1, color: theme.colors.text, fontSize: 15 }}>{label}</Text>
      <Switch value={value} onValueChange={onChange} trackColor={{ true: theme.colors.primary, false: theme.colors.border }} thumbColor="#FFFFFF" />
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.bg }}>
      <View style={{ paddingTop: insets.top + 12, paddingBottom: 12, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', gap: 12, borderBottomWidth: 1, borderBottomColor: theme.mode === 'light' ? '#E5E7EB' : theme.colors.border }}>
        <Pressable onPress={onBack}><Icon.Back size={24} color={theme.colors.text} /></Pressable>
        <Text style={{ color: theme.colors.text, fontSize: 18, fontWeight: '900' }}>Notifications</Text>
      </View>
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        <Text style={{ color: theme.colors.textMuted, fontSize: 12, fontWeight: '900', letterSpacing: 1.2, textTransform: 'uppercase', paddingHorizontal: 20, paddingTop: 24, paddingBottom: 8 }}>Push notifications</Text>
        {row('Chat messages', chat, setChat)}
        {row('Comments on my posts', comments, setComments)}
        {row('When a live starts', lives, setLives)}
        {row('New subscribers', subs, setSubs)}
        {row('Marketing & tips', marketing, setMarketing)}
        <Text style={{ color: theme.colors.textMuted, fontSize: 12, paddingHorizontal: 20, paddingTop: 20 }}>
          Changes are saved locally. Sync across devices is coming.
        </Text>
      </ScrollView>
    </View>
  );
}
