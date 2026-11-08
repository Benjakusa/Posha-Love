import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, Linking } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeProvider';
import { Icon } from '../icons';

type Props = { onBack: () => void };

const iconShadow = (theme: any) => ({
  shadowColor: theme.mode === 'light' ? '#000000' : '#FFFFFF',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: theme.mode === 'light' ? 0.06 : 0.10,
  shadowRadius: 8,
  elevation: theme.mode === 'light' ? 2 : 0,
});

const GROUPS = [
  {
    title: 'Getting started',
    icon: 'star',
    items: [
      { q: 'How do I become a creator?', a: 'Go to your Profile, tap "Become a creator", and fill out the short form — display name, handle, bio, categories, and monthly subscription price. Approval is automatic once you accept the creator rules.' },
      { q: 'Do I need to be 18?', a: 'Yes. POSHA is strictly 18+. We verify age at signup and may re-verify at any time. Accounts found belonging to minors are immediately suspended.' },
      { q: 'How do I sign in on a new phone?', a: 'Enter your email, choose "Sign in", and tap "Send code". We email a 6-digit code that works for 10 minutes. Your posts, subscribers, and messages all follow your email — nothing is lost.' },
    ],
  },
  {
    title: 'Subscriptions & payments',
    icon: 'heart',
    items: [
      { q: 'How do subscriptions work?', a: 'Fans pay a monthly fee to unlock all of a creator\'s content. Creators keep 80%. Cancel anytime — access continues until the end of the billing period.' },
      { q: 'When do I get paid?', a: 'Earnings become available after a 7-day hold (to cover potential refunds). Payouts run weekly to your M-Pesa or bank account. Minimum payout is KSh 2,000.' },
      { q: 'Can I get a refund?', a: 'Refunds are issued for platform errors or unauthorized charges. Contact us within 7 days with your transaction ID. Mid-period cancellations are not pro-rated.' },
    ],
  },
  {
    title: 'Safety',
    icon: 'shield',
    items: [
      { q: 'How do I report someone?', a: 'In chat, tap "Report" in the header. On a post, tap the ⋮ menu. On a profile, tap the ⋯ button. Reports go directly to our safety team and are reviewed within 24 hours.' },
      { q: 'Is my identity private?', a: 'Yes. Your email is never shown. Chat uses random aliases that change with every match. Your profile shows only your handle, display name, and the info you choose to share.' },
      { q: 'What happens to my messages?', a: 'Chat messages are deleted after 7 days unless part of an active safety report. Reported conversations are preserved for investigation and then deleted.' },
    ],
  },
  {
    title: 'Account',
    icon: 'user',
    items: [
      { q: 'How do I delete my account?', a: 'Settings → Privacy → Delete my account. Your profile, posts, and messages are removed within 30 days. Financial records are kept for 7 years as required by law.' },
      { q: 'Can I change my handle?', a: 'Yes — once every 30 days, from Profile → Edit profile. Old handles become available to others after 30 days.' },
    ],
  },
];

export function HelpScreen({ onBack }: Props) {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const [open, setOpen] = useState<string | null>(null);

  const groupIcon = (name: string) => {
    const map: Record<string, React.ReactNode> = {
      star: <Icon.Heart size={20} color={theme.colors.primary} />,
      heart: <Icon.Chat size={20} color={theme.colors.primary} />,
      shield: <Icon.Lock size={20} color={theme.colors.primary} />,
      user: <Icon.User size={20} color={theme.colors.primary} />,
    };
    return map[name] ?? <Icon.Heart size={20} color={theme.colors.primary} />;
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.bg }}>
      <View style={{
        paddingTop: insets.top + 12, paddingBottom: 12, paddingHorizontal: 16,
        flexDirection: 'row', alignItems: 'center', gap: 12,
      }}>
        <Pressable onPress={onBack}><Icon.Back size={24} color={theme.colors.text} /></Pressable>
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        <Text style={{ color: theme.colors.text, fontSize: 30, fontWeight: '900', lineHeight: 36 }}>
          How can we help?
        </Text>
        <Text style={{ color: theme.colors.textMuted, fontSize: 14, marginTop: 6, marginBottom: 24 }}>
          Common questions, answered by our team.
        </Text>

        {GROUPS.map((group) => (
          <View key={group.title} style={{ marginBottom: 20 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10, paddingLeft: 2 }}>
              <View style={[{ width: 32, height: 32, borderRadius: 16, backgroundColor: theme.mode === 'light' ? '#FFFFFF' : theme.colors.surface, alignItems: 'center', justifyContent: 'center' }, iconShadow(theme)]}>
                {groupIcon(group.icon)}
              </View>
              <Text style={{ color: theme.colors.text, fontSize: 15, fontWeight: '900' }}>{group.title}</Text>
            </View>

            <View style={[
              {
                backgroundColor: theme.mode === 'light' ? '#FFFFFF' : theme.colors.surface,
                borderRadius: 16,
                overflow: 'hidden',
              },
              iconShadow(theme),
            ]}>
              {group.items.map((item, i) => {
                const isOpen = open === item.q;
                return (
                  <View key={item.q}>
                    <Pressable
                      onPress={() => setOpen(isOpen ? null : item.q)}
                      style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 14 }}
                    >
                      <Text style={{ flex: 1, color: theme.colors.text, fontSize: 14, fontWeight: '700' }}>
                        {item.q}
                      </Text>
                      <Text style={{ color: theme.colors.textMuted, fontSize: 20, fontWeight: '300', marginTop: -2 }}>
                        {isOpen ? '−' : '+'}
                      </Text>
                    </Pressable>
                    {isOpen ? (
                      <Text style={{ color: theme.colors.textMuted, fontSize: 14, lineHeight: 21, paddingHorizontal: 16, paddingBottom: 16 }}>
                        {item.a}
                      </Text>
                    ) : null}
                    {i < group.items.length - 1 ? (
                      <View style={{ height: 1, backgroundColor: theme.mode === 'light' ? '#F3F4F6' : theme.colors.border, marginLeft: 16, marginRight: 16 }} />
                    ) : null}
                  </View>
                );
              })}
            </View>
          </View>
        ))}

        {/* Contact card */}
        <View style={[
          {
            backgroundColor: theme.mode === 'light' ? '#FFFFFF' : theme.colors.surface,
            borderRadius: 16,
            padding: 20,
            marginTop: 8,
            gap: 12,
          },
          iconShadow(theme),
        ]}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <View style={[{ width: 32, height: 32, borderRadius: 16, backgroundColor: theme.mode === 'light' ? '#FFFFFF' : theme.colors.surface, alignItems: 'center', justifyContent: 'center' }, iconShadow(theme)]}>
              <Icon.Chat size={18} color={theme.colors.primary} />
            </View>
            <Text style={{ color: theme.colors.text, fontSize: 16, fontWeight: '900' }}>Still need help?</Text>
          </View>
          <Text style={{ color: theme.colors.textMuted, fontSize: 14, lineHeight: 20 }}>
            Our team reads every message. We reply within 24 hours on weekdays.
          </Text>
          <Pressable
            onPress={() => Linking.openURL('mailto:hello@posha.app')}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingVertical: 14,
              paddingHorizontal: 16,
              backgroundColor: theme.colors.primary,
              borderRadius: 12,
            }}
          >
            <Text style={{ color: theme.colors.onPrimary, fontSize: 15, fontWeight: '800' }}>hello@posha.app</Text>
            <Icon.Next size={16} color={theme.colors.onPrimary} />
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}
