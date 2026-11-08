import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, TextInput, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeProvider';
import { Icon } from '../icons';
import { API_BASE } from '../api';

type Props = { token: string; onBack: () => void };

const REASONS = [
  'Harassment',
  'Inappropriate content',
  'Spam',
  'Bug in the app',
  'Account issue',
  'Something else',
];

export function ReportProblemScreen({ token, onBack }: Props) {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const [reason, setReason] = useState<string>(REASONS[0]);
  const [details, setDetails] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const chipShadow = {
    shadowColor: theme.mode === 'light' ? '#000000' : '#FFFFFF',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: theme.mode === 'light' ? 0.08 : 0.10,
    shadowRadius: 3,
    elevation: 1,
  };

  const submit = async () => {
    if (!details.trim()) return;
    setSubmitting(true); setError(null);
    try {
      const res = await fetch(`${API_BASE}/catalog/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ reason, details }),
      });
      if (!res.ok) throw new Error('Could not submit — please try again');
      setDone(true);
    } catch (e: any) {
      setError(e?.message ?? 'Failed');
    } finally { setSubmitting(false); }
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.bg }}>
      <View style={{
        paddingTop: insets.top + 12, paddingBottom: 12, paddingHorizontal: 16,
        flexDirection: 'row', alignItems: 'center', gap: 12,
        borderBottomWidth: 1,
        borderBottomColor: theme.mode === 'light' ? '#E5E7EB' : theme.colors.border,
      }}>
        <Pressable onPress={onBack}><Icon.Back size={24} color={theme.colors.text} /></Pressable>
        <Text style={{ color: theme.colors.text, fontSize: 18, fontWeight: '900' }}>Report a problem</Text>
      </View>

      {done ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16, padding: 24 }}>
          <View style={{ width: 72, height: 72, borderRadius: 36, backgroundColor: theme.colors.primary, alignItems: 'center', justifyContent: 'center' }}>
            <Icon.Check size={36} color={theme.colors.onPrimary} />
          </View>
          <Text style={{ color: theme.colors.text, fontSize: 20, fontWeight: '900', textAlign: 'center', marginTop: 8 }}>Thanks for reporting</Text>
          <Text style={{ color: theme.colors.textMuted, fontSize: 14, textAlign: 'center', lineHeight: 20 }}>
            Our safety team will review this within 24 hours. We'll email you if we need more details.
          </Text>
          <Pressable onPress={onBack} style={{ marginTop: 16, paddingHorizontal: 32, paddingVertical: 14, backgroundColor: theme.colors.primary, borderRadius: 999 }}>
            <Text style={{ color: theme.colors.onPrimary, fontWeight: '900', fontSize: 15 }}>Done</Text>
          </Pressable>
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ padding: 20, gap: 24, paddingBottom: 60 }} showsVerticalScrollIndicator={false}>
          <View style={{ gap: 12 }}>
            <Text style={{ color: theme.colors.textMuted, fontSize: 12, fontWeight: '900', letterSpacing: 1.2 }}>
              WHAT HAPPENED
            </Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
              {REASONS.map((r) => {
                const active = reason === r;
                return (
                  <Pressable
                    key={r}
                    onPress={() => setReason(r)}
                    style={[
                      {
                        paddingHorizontal: 12,
                        paddingVertical: 7,
                        borderRadius: 999,
                        backgroundColor: active ? theme.colors.primary : (theme.mode === 'light' ? '#FFFFFF' : theme.colors.surface),
                      },
                      active ? {} : chipShadow,
                    ]}
                  >
                    <Text style={{ color: active ? theme.colors.onPrimary : theme.colors.text, fontSize: 12, fontWeight: '700' }}>
                      {r}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <View style={{ gap: 10 }}>
            <Text style={{ color: theme.colors.textMuted, fontSize: 12, fontWeight: '900', letterSpacing: 1.2 }}>
              TELL US MORE
            </Text>
            <TextInput
              value={details}
              onChangeText={setDetails}
              placeholder="The more detail, the faster we can help..."
              placeholderTextColor={theme.colors.textMuted}
              multiline
              maxLength={2000}
              style={{
                minHeight: 160,
                textAlignVertical: 'top',
                color: theme.colors.text,
                backgroundColor: theme.mode === 'light' ? '#F5F6F8' : theme.colors.surface,
                borderRadius: 14,
                paddingHorizontal: 16,
                paddingVertical: 14,
                fontSize: 14,
                lineHeight: 20,
                ...chipShadow,
              }}
            />
            <Text style={{ color: theme.colors.textMuted, fontSize: 11, textAlign: 'right' }}>{details.length}/2000</Text>
          </View>

          {error ? <Text style={{ color: theme.colors.danger, fontSize: 13 }}>{error}</Text> : null}

          <Pressable
            onPress={submit}
            disabled={!details.trim() || submitting}
            style={{ backgroundColor: details.trim() && !submitting ? theme.colors.primary : theme.colors.border, paddingVertical: 15, borderRadius: 999, alignItems: 'center' }}
          >
            {submitting ? <ActivityIndicator color={theme.colors.onPrimary} /> : (
              <Text style={{ color: theme.colors.onPrimary, fontWeight: '900', fontSize: 15 }}>Submit report</Text>
            )}
          </Pressable>

          <Text style={{ color: theme.colors.textMuted, fontSize: 11, textAlign: 'center', lineHeight: 16 }}>
            Reports are confidential. We never reveal who reported what.
          </Text>
        </ScrollView>
      )}
    </View>
  );
}
