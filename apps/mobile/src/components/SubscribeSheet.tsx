import React, { useState } from 'react';
import { View, Text, Pressable, Modal, TextInput, ActivityIndicator } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { Icon } from '../icons';
import { createSubscription } from '../api';

type Props = {
  visible: boolean;
  token: string;
  creatorAlias: string;
  priceMinor: number;
  onClose: () => void;
  onSubscribed: (creatorAlias: string) => void;
};

export function SubscribeSheet({ visible, token, creatorAlias, priceMinor, onClose, onSubscribed }: Props) {
  const { theme } = useTheme();
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function pay() {
    setLoading(true);
    setError(null);
    try {
      await createSubscription(token, creatorAlias, 'monthly', priceMinor);
      onSubscribed(creatorAlias);
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Payment failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable
        onPress={onClose}
        style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' }}
      >
        <Pressable
          onPress={(e) => e.stopPropagation()}
          style={{
            backgroundColor: theme.colors.bg,
            borderTopLeftRadius: theme.radii.xl,
            borderTopRightRadius: theme.radii.xl,
            padding: 24,
            gap: 16,
            borderTopWidth: 2,
            borderColor: theme.colors.border,
          }}
        >
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={{ color: theme.colors.text, fontSize: 20, fontWeight: '900' }}>
              Subscribe to {creatorAlias}
            </Text>
            <Pressable onPress={onClose} accessibilityLabel="Close">
              <Icon.Close size={22} color={theme.colors.text} />
            </Pressable>
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <View style={{ backgroundColor: theme.colors.primary, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999 }}>
              <Text style={{ color: theme.colors.onPrimary, fontWeight: '900', fontSize: 15 }}>
                KSh {(priceMinor / 100).toFixed(0)} / month
              </Text>
            </View>
            <Text style={{ color: theme.colors.text, fontSize: 13, opacity: 0.75 }}>
              Unlocks all their videos for 30 days.
            </Text>
          </View>

          <Text style={{ color: theme.colors.text, fontSize: 13, fontWeight: '700' }}>
            M-Pesa number
          </Text>
          <TextInput
            value={phone}
            onChangeText={setPhone}
            placeholder="07XX XXX XXX"
            placeholderTextColor={theme.colors.text}
            keyboardType="phone-pad"
            style={{
              borderWidth: 2,
              borderColor: theme.colors.border,
              borderRadius: theme.radii.md,
              paddingHorizontal: 16,
              paddingVertical: 12,
              color: theme.colors.text,
              fontSize: 15,
            }}
          />

          {error ? <Text style={{ color: theme.colors.danger, fontSize: 13 }}>{error}</Text> : null}

          <Pressable
            onPress={pay}
            disabled={loading || phone.replace(/\D/g, '').length < 9}
            style={{
              backgroundColor: theme.colors.primary,
              paddingVertical: 16,
              borderRadius: 999,
              alignItems: 'center',
              opacity: loading || phone.replace(/\D/g, '').length < 9 ? 0.5 : 1,
            }}
          >
            {loading ? (
              <ActivityIndicator color={theme.colors.onPrimary} />
            ) : (
              <Text style={{ color: theme.colors.onPrimary, fontWeight: '900', fontSize: 15 }}>
                Pay and unlock
              </Text>
            )}
          </Pressable>

          <Text style={{ color: theme.colors.text, fontSize: 11, opacity: 0.6, textAlign: 'center' }}>
            Dev mode: payment is simulated. No real money is charged.
          </Text>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
