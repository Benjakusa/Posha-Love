import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, Modal, ActivityIndicator, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeProvider';
import { Icon } from '../icons';
import { API_BASE } from '../api';

type Section = { title: string; body: string; icon: 'lock' | 'eye' | 'share' | 'clock' | 'shield' | 'user' | 'check' | 'bell' | 'heart' | 'chat' };

const cardShadow = (theme: any) => ({
  shadowColor: theme.mode === 'light' ? '#000000' : '#FFFFFF',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: theme.mode === 'light' ? 0.06 : 0.10,
  shadowRadius: 8,
  elevation: theme.mode === 'light' ? 2 : 0,
});

const PRIVACY: { title: string; updated: string; sections: Section[] } = {
  title: 'Privacy policy',
  updated: 'Last updated November 2026',
  sections: [
    { icon: 'eye', title: 'What we collect', body: 'We collect the minimum needed to run POSHA:\n\n• Your email — for sign-in only, never shown\n• Your alias — visible in chats\n• Display name and handle — public on your profile\n• Messages, posts, and any content you upload\n• Device signals to prevent fraud and abuse' },
    { icon: 'heart', title: 'How we use it', body: 'Your data is used only to:\n\n• Deliver the service — messages, content, subscriptions\n• Keep you safe — detect abuse, enforce rules, respond to reports\n• Improve POSHA — anonymized usage signals, never sold\n\nWe never sell your data and never share your email with other users.' },
    { icon: 'share', title: 'Who we share with', body: 'A small set of carefully vetted providers:\n\n• Email delivery for sign-in codes\n• Cloudflare R2 for media storage\n• LiveKit Cloud for video\n• Payment providers for subscriptions\n\nEach is contractually bound to use data only on our instruction.' },
    { icon: 'clock', title: 'Retention', body: '• Chat messages: 7 days\n• Posts and media: until you delete them\n• Account data: 30 days after deletion request\n• Financial records: 7 years (legal requirement)\n• Audit logs: 3 years' },
    { icon: 'shield', title: 'Your rights', body: 'You can access, correct, export, or delete your data at any time.\n\n• Export: tap below for a full copy\n• Delete: tap below to permanently remove your account\n• Contact: privacy@posha.app' },
  ],
};

const TERMS: { title: string; updated: string; sections: Section[] } = {
  title: 'Terms of service',
  updated: 'Last updated November 2026',
  sections: [
    { icon: 'user', title: 'Eligibility', body: 'You must be 18 years or older. By creating an account you confirm you are of legal age. Accounts found belonging to minors are immediately suspended and reported.' },
    { icon: 'lock', title: 'Your account', body: 'You are responsible for:\n\n• Keeping your sign-in secure\n• All activity on your account\n• Not sharing access with others\n\nContact security@posha.app if you suspect compromise.' },
    { icon: 'check', title: 'What you may post', body: 'You may post content you own the rights to. Prohibited:\n\n• Anything involving minors\n• Non-consensual acts or imagery\n• Violence, hate, or illegal activity\n• Harassment, threats, doxxing\n• Copyright or trademark violations\n\nViolation results in removal and possible permanent ban.' },
    { icon: 'heart', title: 'Payments', body: 'Subscriptions are monthly and auto-renew. Cancel anytime — access continues until the period ends.\n\nCreators keep 80%. Payouts run after a 7-day hold. Refunds follow the published policy.' },
    { icon: 'bell', title: 'Termination', body: 'You may close your account anytime. We may suspend or terminate accounts that violate these terms, pose a safety risk, or are used for fraud or illegal activity.' },
  ],
};

export function LegalScreen({ kind, onBack, token }: Props) {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const doc = kind === 'privacy' ? PRIVACY : TERMS;
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [exporting, setExporting] = useState(false);

  const iconFor = (name: Section['icon']) => {
    const map: Record<string, React.ReactNode> = {
      lock: <Icon.Lock size={18} color={theme.colors.primary} />,
      eye: <Icon.Explore size={18} color={theme.colors.primary} />,
      share: <Icon.Next size={18} color={theme.colors.primary} />,
      clock: <Icon.Calendar size={18} color={theme.colors.primary} />,
      shield: <Icon.Check size={18} color={theme.colors.primary} />,
      user: <Icon.User size={18} color={theme.colors.primary} />,
      check: <Icon.Check size={18} color={theme.colors.primary} />,
      bell: <Icon.Bell size={18} color={theme.colors.primary} />,
      heart: <Icon.Heart size={18} color={theme.colors.primary} />,
      chat: <Icon.Chat size={18} color={theme.colors.primary} />,
    };
    return map[name] ?? <Icon.Check size={18} color={theme.colors.primary} />;
  };

  const deleteAccount = async () => {
    setShowDeleteConfirm(false);
    setDeleting(true);
    try {
      const res = await fetch(`${API_BASE}/account`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Delete failed');
      Alert.alert('Account scheduled for deletion', 'Your account will be removed within 30 days.');
      onBack();
    } catch {
      Alert.alert('Could not delete', 'Please try again later or email privacy@posha.app.');
    } finally { setDeleting(false); }
  };

  const exportData = async () => {
    setExporting(true);
    try {
      const res = await fetch(`${API_BASE}/account/export`, { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error('Export failed');
      Alert.alert('Export requested', 'We will email a copy of your data within 24 hours.');
    } catch {
      Alert.alert('Could not export', 'Please email privacy@posha.app.');
    } finally { setExporting(false); }
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
        <Text style={{ color: theme.colors.text, fontSize: 30, fontWeight: '900', lineHeight: 36, marginBottom: 6 }}>
          {doc.title}
        </Text>
        <Text style={{ color: theme.colors.textMuted, fontSize: 13, marginBottom: 24 }}>
          {doc.updated}
        </Text>

        {doc.sections.map((s, i) => (
          <View
            key={s.title}
            style={[
              {
                backgroundColor: theme.mode === 'light' ? '#FFFFFF' : theme.colors.surface,
                borderRadius: 16,
                padding: 18,
                marginBottom: 12,
                flexDirection: 'row',
                gap: 14,
              },
              cardShadow(theme),
            ]}
          >
            <View style={[{ width: 32, height: 32, borderRadius: 16, backgroundColor: theme.mode === 'light' ? '#FFFFFF' : theme.colors.surface, alignItems: 'center', justifyContent: 'center', flexShrink: 0 }, cardShadow(theme)]}>
              {iconFor(s.icon)}
            </View>
            <View style={{ flex: 1, gap: 6 }}>
              <Text style={{ color: theme.colors.text, fontSize: 15, fontWeight: '900' }}>{s.title}</Text>
              <Text style={{ color: theme.colors.textMuted, fontSize: 13, lineHeight: 20 }}>{s.body}</Text>
            </View>
          </View>
        ))}

        {kind === 'privacy' ? (
          <>
            <View style={{ height: 16 }} />
            <Text style={{ color: theme.colors.textMuted, fontSize: 12, fontWeight: '900', letterSpacing: 1.2, marginBottom: 10 }}>
              MANAGE YOUR DATA
            </Text>

            <Pressable
              onPress={exportData}
              disabled={exporting}
              style={[
                {
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 14,
                  backgroundColor: theme.mode === 'light' ? '#FFFFFF' : theme.colors.surface,
                  borderRadius: 16,
                  padding: 18,
                  marginBottom: 10,
                },
                cardShadow(theme),
              ]}
            >
              <View style={[{ width: 32, height: 32, borderRadius: 16, backgroundColor: theme.mode === 'light' ? '#FFFFFF' : theme.colors.surface, alignItems: 'center', justifyContent: 'center' }, cardShadow(theme)]}>
                <Icon.Next size={18} color={theme.colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: theme.colors.text, fontSize: 15, fontWeight: '900' }}>
                  {exporting ? 'Requesting…' : 'Export my data'}
                </Text>
                <Text style={{ color: theme.colors.textMuted, fontSize: 12, marginTop: 2 }}>
                  A copy of everything we have on you, emailed as JSON
                </Text>
              </View>
            </Pressable>

            <Pressable
              onPress={() => setShowDeleteConfirm(true)}
              disabled={deleting}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 14,
                backgroundColor: theme.colors.primary,
                borderRadius: 16,
                padding: 18,
              }}
            >
              <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' }}>
                <Icon.Trash size={18} color="#FFFFFF" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: '#FFFFFF', fontSize: 15, fontWeight: '900' }}>
                  {deleting ? 'Deleting…' : 'Delete my account'}
                </Text>
                <Text style={{ color: 'rgba(255,255,255,0.85)', fontSize: 12, marginTop: 2 }}>
                  Removes your profile, posts, and messages within 30 days
                </Text>
              </View>
            </Pressable>
          </>
        ) : null}

        <Text style={{ color: theme.colors.textMuted, fontSize: 11, textAlign: 'center', marginTop: 32 }}>
          © 2026 POSHA. All rights reserved.
        </Text>
      </ScrollView>

      {/* Delete confirmation modal */}
      <Modal visible={showDeleteConfirm} transparent animationType="fade" onRequestClose={() => setShowDeleteConfirm(false)}>
        <Pressable onPress={() => setShowDeleteConfirm(false)} style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <Pressable onPress={(e) => e.stopPropagation()} style={{ backgroundColor: theme.colors.bg, borderRadius: 20, padding: 24, gap: 12, width: '100%', maxWidth: 400 }}>
            <Text style={{ color: theme.colors.text, fontSize: 18, fontWeight: '900' }}>Delete account?</Text>
            <Text style={{ color: theme.colors.textMuted, fontSize: 14, lineHeight: 20 }}>
              This will permanently remove your profile, posts, messages, and subscriptions. Financial records are kept for 7 years as required by law.
            </Text>
            <Text style={{ color: theme.colors.danger, fontSize: 13, fontWeight: '700', marginTop: 4 }}>
              This cannot be undone.
            </Text>
            <View style={{ flexDirection: 'row', gap: 10, marginTop: 12 }}>
              <Pressable onPress={() => setShowDeleteConfirm(false)} style={{ flex: 1, paddingVertical: 12, borderRadius: 999, alignItems: 'center', borderWidth: 1, borderColor: theme.colors.border }}>
                <Text style={{ color: theme.colors.text, fontWeight: '800', fontSize: 14 }}>Cancel</Text>
              </Pressable>
              <Pressable onPress={deleteAccount} style={{ flex: 1, paddingVertical: 12, borderRadius: 999, alignItems: 'center', backgroundColor: theme.colors.danger }}>
                {deleting ? <ActivityIndicator color="#FFFFFF" /> : <Text style={{ color: '#FFFFFF', fontWeight: '900', fontSize: 14 }}>Delete</Text>}
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

type Props = { kind: 'privacy' | 'terms'; onBack: () => void; token?: string };
