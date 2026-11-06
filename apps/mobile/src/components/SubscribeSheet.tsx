import React, { useState } from 'react';
import { View, Text, Pressable, Modal } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { Icon } from '../icons';
import { Input } from './Input';
import { Button } from './Button';
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
        style={{ flex: 1, backgroundColor: theme.colors.scrim, justifyContent: 'flex-end' }}
      >
        <Pressable
          onPress={(e) => e.stopPropagation()}
          style={{
            backgroundColor: theme.colors.bg,
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16,
            padding: 16,
            gap: 16,
          }}
        >
          {/* Grab handle */}
          <View style={{ width: 36, height: 4, borderRadius: 2, backgroundColor: theme.colors.border, alignSelf: 'center' }} />

          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={{ color: theme.colors.text, fontSize: 17, fontWeight: '700', lineHeight: 22 }}>
              Subscribe to {creatorAlias}
            </Text>
            <Pressable onPress={onClose} accessibilityLabel="Close" style={{ padding: 4 }}>
              <Icon.Close size={20} color={theme.colors.icon} />
            </Pressable>
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <View style={{ backgroundColor: theme.colors.accentSoft, paddingHorizontal: 12, paddingVertical: 6, borderRadius: theme.radii.pill }}>
              <Text style={{ color: theme.colors.primaryText, fontWeight: '600', fontSize: 15 }}>
                KSh {(priceMinor / 100).toFixed(0)} / month
              </Text>
            </View>
            <Text style={{ color: theme.colors.textMuted, fontSize: 13, flex: 1 }}>
              Unlocks all their videos for 30 days.
            </Text>
          </View>

          <Input
            label="M-Pesa number"
            value={phone}
            onChangeText={setPhone}
            placeholder="07XX XXX XXX"
            keyboardType="phone-pad"
            error={error}
          />

          <Button
            label="Pay and unlock"
            onPress={pay}
            disabled={loading || phone.replace(/\D/g, '').length < 9}
            loading={loading}
            minHeight={48}
          />

          <Text style={{ color: theme.colors.textMuted, fontSize: 12, textAlign: 'center' }}>
            Dev mode: payment is simulated. No real money is charged.
          </Text>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
