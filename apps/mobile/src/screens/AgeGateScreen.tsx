import React, { useState } from 'react';
import { View, Text, Pressable, ActivityIndicator } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { Screen } from '../components/Screen';
import { Button } from '../components/Button';
import { Icon } from '../icons';

type Props = { onEnter: () => Promise<void> };

export function AgeGateScreen({ onEnter }: Props) {
  const { theme } = useTheme();
  const [confirmed, setConfirmed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function enter() {
    if (!confirmed || loading) return;
    setLoading(true);
    setError(null);
    try {
      await onEnter();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not start session');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen padded={false}>
      <View style={{ flex: 1, padding: 32, justifyContent: 'space-between' }}>
        <Text style={{ color: theme.colors.text, fontSize: theme.fontSizes.lg, fontWeight: '900', letterSpacing: 6 }}>
          posha
        </Text>

        <View style={{ gap: 20 }}>
          <View style={{ width: 80, height: 3, backgroundColor: theme.colors.primary }} />
          <Text style={{ color: theme.colors.text, fontSize: 56, fontWeight: '900', lineHeight: 60, letterSpacing: -1 }}>
            Meet.{'\n'}Chat.{'\n'}Connect.
          </Text>
          <Text style={{ color: theme.colors.text, fontSize: theme.fontSizes.md, maxWidth: 320 }}>
            Adults only. Non-explicit. Report, block, and leave at any time.
          </Text>
        </View>

        <View style={{ gap: 16 }}>
          <Pressable
            onPress={() => setConfirmed((c) => !c)}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: confirmed }}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 16,
              paddingVertical: 16,
              borderTopWidth: 2,
              borderBottomWidth: 2,
              borderColor: theme.colors.border,
            }}
          >
            <View
              style={{
                width: 28, height: 28,
                borderWidth: 2, borderColor: theme.colors.border,
                backgroundColor: confirmed ? theme.colors.primary : 'transparent',
                alignItems: 'center', justifyContent: 'center',
              }}
            >
              {confirmed ? <Icon.Check size={16} color={theme.colors.onPrimary} /> : null}
            </View>
            <Text style={{ color: theme.colors.text, fontSize: theme.fontSizes.md, fontWeight: '600', flex: 1 }}>
              I am 18 years or older
            </Text>
          </Pressable>

          {error ? (
            <Text style={{ color: theme.colors.danger, fontSize: theme.fontSizes.sm }}>{error}</Text>
          ) : null}

          <Button
            label={loading ? '' : 'Enter as guest'}
            onPress={enter}
            disabled={!confirmed}
            loading={loading}
          />

          <Text style={{ color: theme.colors.text, fontSize: theme.fontSizes.xs }}>
            By entering you agree to the{' '}
            <Text style={{ color: theme.colors.link, textDecorationLine: 'underline' }}>Terms</Text>
            . Adults only. Non-explicit.
          </Text>
        </View>
      </View>
    </Screen>
  );
}
