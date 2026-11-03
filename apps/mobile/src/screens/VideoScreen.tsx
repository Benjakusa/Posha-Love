import React, { useEffect, useRef, useState, useCallback } from 'react';
import { View, Text, Pressable, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { Socket } from 'socket.io-client';
import { useTheme } from '../theme/ThemeProvider';
import { Icon } from '../icons';
import { createConnectSocket } from '../connect/socket';
import { API_BASE } from '../api';
import { VideoRoomScreen } from './VideoRoomScreen';

type Props = { token: string; onBack: () => void };

type TokenPayload = { wsUrl: string; token: string; roomName: string; maxSeconds: number };

export function VideoScreen({ token, onBack }: Props) {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const [status, setStatus] = useState<'searching' | 'matched' | 'connecting' | 'error'>('searching');
  const [partnerId, setPartnerId] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [payload, setPayload] = useState<TokenPayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const socket = createConnectSocket(token);
    socketRef.current = socket;

    socket.on('connect', () => {
      socket.emit('connect:join');
    });
    socket.on('queue:waiting', () => setStatus('searching'));
    socket.on('session:matched', (p: { sessionId: string; partner: { alias: string } }) => {
      setSessionId(p.sessionId);
      setPartnerId(p.partner.alias);
      setStatus('matched');
    });
    socket.on('session:ended', () => {
      setStatus('searching');
      setPartnerId(null);
      setSessionId(null);
      setPayload(null);
      socket.emit('connect:join');
    });

    return () => {
      socket.emit('connect:leave');
      socket.disconnect();
      socketRef.current = null;
    };
  }, [token]);

  // When matched, fetch LiveKit token
  useEffect(() => {
    if (status !== 'matched' || !sessionId) return;
    let cancelled = false;
    (async () => {
      try {
        setStatus('connecting');
        const res = await fetch(`${API_BASE}/connect/video-token`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ sessionId, partnerId }),
        });
        if (!res.ok) throw new Error(`token HTTP ${res.status}`);
        const json = (await res.json()) as TokenPayload;
        if (!cancelled) {
          setPayload(json);
          setStatus('matched');
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : 'Could not start video');
          setStatus('error');
        }
      }
    })();
    return () => { cancelled = true; };
  }, [status, sessionId, partnerId, token]);

  const leave = useCallback(() => {
    socketRef.current?.emit('connect:leave');
    onBack();
  }, [onBack]);

  if (payload) {
    return <VideoRoomScreen payload={payload} onLeave={leave} />;
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.bg, paddingTop: insets.top + 12 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, gap: 12 }}>
        <Pressable onPress={leave} accessibilityLabel="Back">
          <Icon.Back size={26} color={theme.colors.text} />
        </Pressable>
        <Text style={{ color: theme.colors.text, fontSize: 15, fontWeight: '800' }}>
          Video chat
        </Text>
      </View>

      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, gap: 16 }}>
        <View
          style={{
            width: 100, height: 100, borderRadius: 50,
            borderWidth: 4, borderColor: theme.colors.primary,
            alignItems: 'center', justifyContent: 'center',
          }}
        >
          {status === 'searching' || status === 'connecting' ? (
            <ActivityIndicator color={theme.colors.primary} size="large" />
          ) : (
            <Icon.Video size={48} color={theme.colors.primary} />
          )}
        </View>
        <Text style={{ color: theme.colors.text, fontSize: 18, fontWeight: '800', textAlign: 'center' }}>
          {status === 'searching'
            ? 'Looking for someone…'
            : status === 'matched'
            ? `Matched with ${partnerId}`
            : status === 'connecting'
            ? 'Preparing video…'
            : 'Video unavailable'}
        </Text>
        {status === 'searching' ? (
          <Text style={{ color: theme.colors.text, fontSize: 13, textAlign: 'center', opacity: 0.7 }}>
            Guests: 2 minute limit. Be kind. You can leave anytime.
          </Text>
        ) : null}
        {error ? (
          <Text style={{ color: theme.colors.danger, fontSize: 13, textAlign: 'center' }}>{error}</Text>
        ) : null}
        <Pressable
          onPress={leave}
          style={{
            marginTop: 12, paddingVertical: 12, paddingHorizontal: 24,
            borderWidth: 2, borderColor: theme.colors.border, borderRadius: 999,
          }}
        >
          <Text style={{ color: theme.colors.text, fontWeight: '800' }}>Cancel</Text>
        </Pressable>
      </View>
    </View>
  );
}
