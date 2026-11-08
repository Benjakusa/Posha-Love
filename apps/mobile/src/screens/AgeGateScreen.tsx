import React, { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeProvider';
import { Screen } from '../components/Screen';
import { Button } from '../components/Button';

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

        {/* Centre block — left aligned, three lines */}
        <View style={{ gap: 16 }}>
          <Text style={{
            color: theme.colors.text,
            fontSize: 48,
            fontWeight: '900',
            lineHeight: 52,
            letterSpacing: -1,
            textAlign: 'left',
          }}>
            Meet.{'\n'}Chat.{'\n'}Connect.
          </Text>

          <Text
            style={{
              color: theme.colors.textMuted,
              fontSize: 15,
              fontWeight: '400',
              lineHeight: 21,
              textAlign: 'left',
              maxWidth: 320,
            }}
          >
            Adults only. Non-explicit. Report, block, and leave at any time.
          </Text>
        </View>

        {/* Bottom block */}
        <View style={{ gap: 12 }}>
          {/* Age confirmation row — clean, no box */}
          <Pressable
            onPress={() => setConfirmed((c) => !c)}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: confirmed }}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 12,
              paddingVertical: 14,
            }}
          >
            <View
              style={{
                width: 24,
                height: 24,
                borderRadius: 6,
                borderWidth: 2,
                borderColor: confirmed ? theme.colors.primary : theme.colors.border,
                backgroundColor: confirmed ? theme.colors.primary : 'transparent',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {confirmed ? <Text style={{ color: theme.colors.onPrimary, fontSize: 16, fontWeight: '900' }}>✓</Text> : null}
            </View>
            <Text style={{ color: theme.colors.text, fontSize: 15, fontWeight: '600', flex: 1 }}>
              I am 18 years or older
            </Text>
          </Pressable>

          {/* Error — only appears after pressing a button */}
          {error ? (
            <Text style={{ color: theme.colors.danger, fontSize: 13, lineHeight: 18 }}>{error}</Text>
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
            <Text style={{ color: theme.colors.primaryText, textDecorationLine: 'underline' }}> Terms</Text>.
          </Text>
        </View>
      </View>
    </Screen>
  );
}
