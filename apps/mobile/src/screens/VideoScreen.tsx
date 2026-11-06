import React, { useEffect, useRef, useState, useCallback } from 'react';
import { View, Text, Pressable, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { Socket } from 'socket.io-client';
import { useTheme } from '../theme/ThemeProvider';
import { Icon } from '../icons';
import { createConnectSocket } from '../connect/socket';

type Props = { token: string; onBack: () => void };

export function VideoScreen({ token, onBack }: Props) {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const [status, setStatus] = useState<'searching' | 'matched' | 'error'>('searching');
  const [partnerAlias, setPartnerAlias] = useState<string | null>(null);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const socket = createConnectSocket(token);
    socketRef.current = socket;
    socket.on('connect', () => socket.emit('connect:join'));
    socket.on('queue:waiting', () => setStatus('searching'));
    socket.on('session:matched', (p: { partner: { alias: string } }) => {
      setPartnerAlias(p.partner.alias);
      setStatus('matched');
    });
    socket.on('session:ended', () => {
      setStatus('searching');
      setPartnerAlias(null);
      socket.emit('connect:join');
    });
    return () => { socket.emit('connect:leave'); socket.disconnect(); socketRef.current = null; };
  }, [token]);

  const leave = useCallback(() => {
    socketRef.current?.emit('connect:leave');
    onBack();
  }, [onBack]);

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.bg, paddingTop: insets.top + 12 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, gap: 12 }}>
        <Pressable onPress={leave} accessibilityLabel="Back">
          <Icon.Back size={26} color={theme.colors.text} />
        </Pressable>
        <Text style={{ color: theme.colors.text, fontSize: 15, fontWeight: '800' }}>Video chat</Text>
      </View>

      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, gap: 16 }}>
        <View style={{ width: 100, height: 100, borderRadius: 50, borderWidth: 4, borderColor: theme.colors.primary, alignItems: 'center', justifyContent: 'center' }}>
          {status === 'searching' ? (
            <ActivityIndicator color={theme.colors.primary} size="large" />
          ) : (
            <Icon.Video size={48} color={theme.colors.primary} />
          )}
        </View>

        <Text style={{ color: theme.colors.text, fontSize: 18, fontWeight: '800', textAlign: 'center' }}>
          {status === 'searching' ? 'Looking for someone…' : `Matched with ${partnerAlias}`}
        </Text>

        {status === 'searching' ? (
          <Text style={{ color: theme.colors.textMuted, fontSize: 13, textAlign: 'center' }}>
            Guests: 2 minute limit. Be kind. You can leave anytime.
          </Text>
        ) : null}

        {status === 'matched' ? (
          <View style={{ marginTop: 12, paddingVertical: 14, paddingHorizontal: 16, borderWidth: 2, borderColor: theme.colors.warning, borderRadius: theme.radii.md, backgroundColor: theme.colors.surface, gap: 6, alignItems: 'center' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Icon.Warning size={18} color={theme.colors.warning} />
              <Text style={{ color: theme.colors.text, fontSize: 13, textAlign: 'center', fontWeight: '800' }}>
                Video calling is not available in Expo Go.
              </Text>
            </View>
            <Text style={{ color: theme.colors.textMuted, fontSize: 12, textAlign: 'center' }}>
              Build the native app to enable camera streaming. You can still chat via text.
            </Text>
          </View>
        ) : null}

        <Pressable onPress={leave} style={{ marginTop: 12, paddingVertical: 12, paddingHorizontal: 24, borderWidth: 2, borderColor: theme.colors.border, borderRadius: 999 }}>
          <Text style={{ color: theme.colors.text, fontWeight: '800' }}>{status === 'matched' ? 'Leave' : 'Cancel'}</Text>
        </Pressable>
      </View>
    </View>
  );
}
