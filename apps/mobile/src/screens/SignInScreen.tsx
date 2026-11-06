import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeProvider';
import { Icon } from '../icons';
import { API_BASE } from '../api';
import type { GuestSessionResponse } from '@posha/shared';

type Props = {
  role: 'member' | 'creator';
  onSuccess: (session: GuestSessionResponse) => void;
  onBack: () => void;
};

export function SignInScreen({ role, onSuccess, onBack }: Props) {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const [step, setStep] = useState<'email' | 'code'>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const requestOtp = async () => {
    setLoading(true); setError(null);
    try {
      const res = await fetch(`${API_BASE}/auth/otp/request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), role }),
      });
      if (!res.ok) throw new Error('Could not send code');
      setStep('code');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed');
    } finally { setLoading(false); }
  };

  const verifyOtp = async () => {
    setLoading(true); setError(null);
    try {
      const res = await fetch(`${API_BASE}/auth/otp/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), code: code.trim() }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ code: 'UNKNOWN' }));
        throw new Error(err.code ?? 'Invalid code');
      }
      const json = await res.json();
      onSuccess({
        token: json.token,
        alias: json.alias,
        role: json.role,
        ageLevel: 'L2',
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        isNewUser: json.isNewUser,
        creatorStatus: json.creatorStatus,
      } as GuestSessionResponse);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed');
    } finally { setLoading(false); }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={{ flex: 1, backgroundColor: theme.colors.bg }}>
        <View style={{
          paddingTop: insets.top + 12, paddingBottom: 12, paddingHorizontal: 16,
          flexDirection: 'row', alignItems: 'center', gap: 12,
          borderBottomWidth: 2, borderBottomColor: theme.colors.border,
        }}>
          <Pressable onPress={onBack}><Icon.Back size={26} color={theme.colors.text} /></Pressable>
          <Text style={{ color: theme.colors.text, fontSize: 15, fontWeight: '800' }}>
            {role === 'creator' ? 'Sign in as creator' : 'Sign in'}
          </Text>
        </View>

        <View style={{ padding: 24, gap: 20 }}>
          {step === 'email' ? (
            <>
              <Text style={{ color: theme.colors.text, fontSize: 28, fontWeight: '900' }}>Enter your email</Text>
              <Text style={{ color: theme.colors.text, fontSize: 14, opacity: 0.7 }}>
                We'll send you a 6-digit code. It expires in 10 minutes.
              </Text>
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="you@example.com"
                placeholderTextColor={theme.colors.text}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                style={input(theme)}
              />
              {error ? <Text style={{ color: theme.colors.danger, fontSize: 13 }}>{error}</Text> : null}
              <Pressable
                onPress={requestOtp}
                disabled={!email.includes('@') || loading}
                style={[btn(theme), { opacity: !email.includes('@') || loading ? 0.5 : 1 }]}
              >
                {loading ? <ActivityIndicator color={theme.colors.onPrimary} /> :
                  <Text style={{ color: theme.colors.onPrimary, fontWeight: '800', fontSize: 16 }}>Send code</Text>}
              </Pressable>
            </>
          ) : (
            <>
              <Text style={{ color: theme.colors.text, fontSize: 28, fontWeight: '900' }}>Enter the code</Text>
              <Text style={{ color: theme.colors.text, fontSize: 14, opacity: 0.7 }}>
                Sent to {email}. Check the API terminal if using console delivery.
              </Text>
              <TextInput
                value={code}
                onChangeText={(t) => setCode(t.replace(/[^0-9]/g, '').slice(0, 6))}
                placeholder="000000"
                placeholderTextColor={theme.colors.text}
                keyboardType="number-pad"
                maxLength={6}
                style={[input(theme), { fontSize: 28, textAlign: 'center', letterSpacing: 8 }]}
              />
              {error ? <Text style={{ color: theme.colors.danger, fontSize: 13 }}>{error}</Text> : null}
              <Pressable
                onPress={verifyOtp}
                disabled={code.length !== 6 || loading}
                style={[btn(theme), { opacity: code.length !== 6 || loading ? 0.5 : 1 }]}
              >
                {loading ? <ActivityIndicator color={theme.colors.onPrimary} /> :
                  <Text style={{ color: theme.colors.onPrimary, fontWeight: '800', fontSize: 16 }}>Verify</Text>}
              </Pressable>
              <Pressable onPress={() => setStep('email')}>
                <Text style={{ color: theme.colors.text, fontSize: 13, textAlign: 'center', opacity: 0.7 }}>
                  Use a different email
                </Text>
              </Pressable>
            </>
          )}
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const input = (theme: ReturnType<typeof useTheme>['theme']) => ({
  color: theme.colors.text,
  borderWidth: 2, borderColor: theme.colors.border, borderRadius: theme.radii.md,
  paddingHorizontal: 16, paddingVertical: 14, fontSize: 16,
} as const);

const btn = (theme: ReturnType<typeof useTheme>['theme']) => ({
  backgroundColor: theme.colors.primary,
  paddingVertical: 16, borderRadius: 999, alignItems: 'center' as const,
} as const);
