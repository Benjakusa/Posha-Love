import React, { useState } from 'react';
import { View, Text, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { BackBar } from '../components/BackBar';
import { Chip } from '../components/Chip';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { API_BASE } from '../api';
import type { GuestSessionResponse } from '@posha/shared';

type Props = {
  role: 'member' | 'creator';
  onSuccess: (session: GuestSessionResponse) => void;
  onBack: () => void;
};

export function SignInScreen({ role: initialRole, onSuccess, onBack }: Props) {
  const { theme } = useTheme();
  const [role, setRole] = useState<'member' | 'creator'>(initialRole);
  const [step, setStep] = useState<'email' | 'code'>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const requestOtp = async () => {
    setLoading(true);
    setError(null);
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
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async () => {
    setLoading(true);
    setError(null);
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
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: theme.colors.bg }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <BackBar onBack={onBack} />

      <ScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 24, gap: 20 }}>
        {/* Role pill */}
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <Chip label="Member" selected={role === 'member'} onPress={() => setRole('member')} />
          <Chip label="Creator" selected={role === 'creator'} onPress={() => setRole('creator')} />
        </View>

        {step === 'email' ? (
          <View style={{ gap: 16 }}>
            <View style={{ gap: 6 }}>
              <Text style={{ color: theme.colors.text, fontSize: 24, fontWeight: '700', lineHeight: 28 }}>
                Enter your email
              </Text>
              <Text style={{ color: theme.colors.textMuted, fontSize: 15, lineHeight: 21 }}>
                We'll send you a 6-digit code.
              </Text>
            </View>

            <Input
              value={email}
              onChangeText={setEmail}
              placeholder="you@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              error={error}
            />

            <Button
              label="Send code"
              onPress={requestOtp}
              disabled={!email.includes('@') || loading}
              loading={loading}
              minHeight={48}
              style={{ marginTop: 16 }}
            />
          </View>
        ) : (
          <View style={{ gap: 16 }}>
            <View style={{ gap: 6 }}>
              <Text style={{ color: theme.colors.text, fontSize: 24, fontWeight: '700', lineHeight: 28 }}>
                Enter the code
              </Text>
              <Text style={{ color: theme.colors.textMuted, fontSize: 15, lineHeight: 21 }}>
                Sent to {email}. Check the API terminal if using console delivery.
              </Text>
            </View>

            <Input
              value={code}
              onChangeText={(t) => setCode(t.replace(/[^0-9]/g, '').slice(0, 6))}
              placeholder="000000"
              keyboardType="number-pad"
              maxLength={6}
              error={error}
              style={{ fontSize: 24, fontWeight: '600', letterSpacing: 8, textAlign: 'center' }}
            />

            <Button
              label="Verify"
              onPress={verifyOtp}
              disabled={code.length !== 6 || loading}
              loading={loading}
              minHeight={48}
              style={{ marginTop: 16 }}
            />

            <View style={{ alignItems: 'center', gap: 8 }}>
              <Button label="Use a different email" variant="tertiary" onPress={() => setStep('email')} />
              <Button label="Resend code" variant="tertiary" onPress={requestOtp} />
            </View>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
