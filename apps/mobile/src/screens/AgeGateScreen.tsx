import React, { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeProvider';
import { Screen } from '../components/Screen';

type Props = {
  onGuest: () => Promise<void>;
  onSignIn: () => void;
  onSignInCreator: () => void;
};

export function AgeGateScreen({ onGuest, onSignIn, onSignInCreator }: Props) {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const [confirmed, setConfirmed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function enterGuest() {
    if (!confirmed || loading) return;
    setLoading(true);
    setError(null);
    try {
      await onGuest();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not start session');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen padded={false}>
      <View style={{ flex: 1, paddingHorizontal: 24, paddingBottom: 24, justifyContent: 'space-between' }}>
        {/* Top: Wordmark */}
        <View style={{ paddingTop: Math.max(insets.top + 8, 24) }}>
          <Text
            style={{
              color: theme.colors.primary,
              fontSize: 32,
              fontWeight: '700',
              lineHeight: 36,
              letterSpacing: -0.5,
            }}
          >
            posha
          </Text>
        </View>

        {/* Centre block */}
        <View style={{ alignItems: 'center', gap: 16 }}>
          {/* Solid red circle replacement for gradient */}
          <View style={{
            width: 120,
            height: 120,
            borderRadius: 28,
            backgroundColor: theme.colors.primary,
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 16,
          }}>
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 4,
            }}>
              <Text style={{ color: '#FFFFFF', fontSize: 36 }}>\u2661</Text>
              <Text style={{ color: '#FFFFFF', fontSize: 36 }}>\u2709</Text>
            </View>
          </View>

          <Text style={{ color: theme.colors.text, fontSize: 28, fontWeight: '700', lineHeight: 34, textAlign: 'center' }}>
            Meet. Chat. Connect.
          </Text>

          <Text
            style={{
              color: theme.colors.textMuted,
              fontSize: 15,
              fontWeight: '400',
              lineHeight: 21,
              textAlign: 'center',
              maxWidth: 300,
            }}
          >
            Adults only. Non-explicit. Report, block, and leave at any time.
          </Text>
        </View>

        {/* Bottom block */}
        <View style={{ gap: 12 }}>
          {/* Age confirmation row */}
          <Pressable
            onPress={() => setConfirmed((c) => !c)}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: confirmed }}
            style={{
              backgroundColor: theme.colors.surface,
              borderRadius: theme.radii.lg,
              padding: 14,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 12,
            }}
          >
            <View
              style={{
                width: 24,
                height: 24,
                borderRadius: 6,
                borderWidth: 1.5,
                borderColor: confirmed ? theme.colors.primary : theme.colors.border,
                backgroundColor: confirmed ? theme.colors.primary : 'transparent',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {confirmed ? <Text style={{ color: theme.colors.onPrimary, fontSize: 14, fontWeight: '600' }}>\u2713</Text> : null}
            </View>
            <Text style={{ color: theme.colors.text, fontSize: 15, fontWeight: '600', flex: 1 }}>
              I am 18 years or older
            </Text>
          </Pressable>

          {error ? (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Text style={{ color: theme.colors.danger, fontSize: 13, lineHeight: 18, flex: 1 }}>{error}</Text>
            </View>
          ) : null}

          <Button
            label="Continue as guest"
            onPress={enterGuest}
            disabled={!confirmed || loading}
            loading={loading}
            minHeight={48}
          />

          <Button
            label="Sign in"
            variant="secondary"
            onPress={onSignIn}
            disabled={!confirmed}
            minHeight={44}
          />

          <Button
            label="Sign in as creator"
            variant="tertiary"
            onPress={onSignInCreator}
            disabled={!confirmed}
            minHeight={44}
          />

          <Text style={{ color: theme.colors.textMuted, fontSize: 12, lineHeight: 16, textAlign: 'center' }}>
            By entering you agree to the
            <Text style={{ color: theme.colors.primaryText, textDecorationLine: 'underline' }}>Terms</Text>.
          </Text>
        </View>
      </View>
    </Screen>
  );
}
