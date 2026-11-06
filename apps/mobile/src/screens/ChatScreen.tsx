import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  View, Text, TextInput, Pressable, ScrollView, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { Socket } from 'socket.io-client';
import { useTheme } from '../theme/ThemeProvider';
import { Icon } from '../icons';
import { createConnectSocket } from '../connect/socket';

type Props = { token: string; onBack: () => void };

type MsgStatus = 'sending' | 'delivered' | 'read';
type Msg = {
  id: string;
  serverId?: string;
  from: 'me' | 'them';
  alias?: string;
  text: string;
  ts: number;
  status?: MsgStatus;
};

const fmtTime = (ts: number) =>
  new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

export function ChatScreen({ token, onBack }: Props) {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const [status, setStatus] = useState<'connecting' | 'waiting' | 'matched' | 'ended'>('connecting');
  const [partnerAlias, setPartnerAlias] = useState<string | null>(null);
  const [partnerOnline, setPartnerOnline] = useState(true);
  const [lastSeen, setLastSeen] = useState<number | null>(null);
  const [partnerTyping, setPartnerTyping] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [draft, setDraft] = useState('');
  const socketRef = useRef<Socket | null>(null);
  const scrollRef = useRef<ScrollView | null>(null);
  const typingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isTyping = useRef(false);

  useEffect(() => {
    const socket = createConnectSocket(token);
    socketRef.current = socket;

    socket.on('connect', () => { setStatus('waiting'); socket.emit('connect:join'); });
    socket.on('queue:waiting', () => setStatus('waiting'));

    socket.on('session:matched', (payload: { partner: { alias: string; online?: boolean } }) => {
      setPartnerAlias(payload.partner.alias);
      setPartnerOnline(payload.partner.online ?? true);
      setPartnerTyping(false);
      setLastSeen(null);
      setMessages([]);
      setStatus('matched');
    });

    socket.on('message:delivered', (p: { clientId?: string; serverId: string; ts: number }) => {
      if (!p.clientId) return;
      setMessages((prev) => prev.map((m) =>
        m.id === p.clientId ? { ...m, serverId: p.serverId, status: 'delivered' } : m));
    });

    socket.on('message:receive', (m: { from: string; text: string; ts: number; serverId: string }) => {
      setMessages((prev) => [...prev, {
        id: `${m.ts}-them`, serverId: m.serverId, from: 'them',
        alias: m.from, text: m.text, ts: m.ts,
      }]);
      socketRef.current?.emit('message:read', { serverIds: [m.serverId] });
    });

    socket.on('message:read', (p: { serverIds: string[] }) => {
      setMessages((prev) => prev.map((m) =>
        m.serverId && p.serverIds.includes(m.serverId) ? { ...m, status: 'read' } : m));
    });

    socket.on('typing:start', () => setPartnerTyping(true));
    socket.on('typing:stop', () => setPartnerTyping(false));

    socket.on('partner:offline', (p: { lastSeen: number }) => {
      setPartnerOnline(false);
      setPartnerTyping(false);
      setLastSeen(p.lastSeen);
    });

    socket.on('session:ended', () => {
      setStatus('waiting'); setPartnerAlias(null); setPartnerOnline(true);
      setPartnerTyping(false); setMessages([]);
      socket.emit('connect:join');
    });

    socket.on('connect:error', () => setStatus('ended'));
    socket.on('disconnect', () => setStatus('connecting'));

    return () => {
      if (typingTimer.current) clearTimeout(typingTimer.current);
      socket.emit('connect:leave');
      socket.disconnect();
      socketRef.current = null;
    };
  }, [token]);

  useEffect(() => {
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 80);
  }, [messages.length, partnerTyping]);

  const emitTyping = useCallback((typing: boolean) => {
    if (typing === isTyping.current) return;
    isTyping.current = typing;
    socketRef.current?.emit(typing ? 'typing:start' : 'typing:stop');
  }, []);

  const onDraftChange = useCallback((text: string) => {
    setDraft(text);
    if (text.length > 0) {
      emitTyping(true);
      if (typingTimer.current) clearTimeout(typingTimer.current);
      typingTimer.current = setTimeout(() => emitTyping(false), 1500);
    } else {
      emitTyping(false);
    }
  }, [emitTyping]);

  const send = useCallback(() => {
    const text = draft.trim();
    if (!text || !socketRef.current || status !== 'matched') return;
    const clientId = `${Date.now()}-me`;
    socketRef.current.emit('message:send', { text, clientId });
    setMessages((prev) => [...prev, { id: clientId, from: 'me', text, ts: Date.now(), status: 'sending' }]);
    setDraft('');
    emitTyping(false);
    if (typingTimer.current) clearTimeout(typingTimer.current);
  }, [draft, status, emitTyping]);

  const next = useCallback(() => {
    socketRef.current?.emit('connect:next');
    setStatus('waiting'); setPartnerAlias(null); setPartnerTyping(false); setMessages([]);
  }, []);

  const report = useCallback(() => { socketRef.current?.emit('session:report'); }, []);

  const leave = useCallback(() => {
    socketRef.current?.emit('connect:leave');
    onBack();
  }, [onBack]);

  const subtitle = (() => {
    if (status === 'connecting') return 'connecting…';
    if (status === 'waiting') return 'looking for someone';
    if (status === 'ended') return 'disconnected';
    if (!partnerOnline) return lastSeen ? `offline · last seen ${fmtTime(lastSeen)}` : 'offline';
    if (partnerTyping) return 'typing…';
    return 'online';
  })();

  const renderTick = (s?: MsgStatus) => {
    if (s === 'read') return <Text style={{ color: theme.chat.tick, fontSize: 12 }}>✓✓</Text>;
    if (s === 'delivered') return <Text style={{ color: theme.chat.tickDelivered, fontSize: 12 }}>✓</Text>;
    return <Text style={{ color: theme.chat.meta, fontSize: 12 }}>·</Text>;
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={{ flex: 1, backgroundColor: theme.chat.bg }}>
        {/* HEADER */}
        <View style={{
          paddingTop: insets.top + 12, paddingBottom: 12, paddingHorizontal: 16,
          flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
          backgroundColor: theme.colors.bg, borderBottomWidth: 1, borderBottomColor: theme.colors.border,
        }}>
          <Pressable onPress={leave}><Icon.Back size={26} color={theme.colors.text} /></Pressable>
          <View style={{ alignItems: 'center' }}>
            <Text style={{ color: theme.colors.text, fontSize: 15, fontWeight: '800' }}>
              {status === 'matched' && partnerAlias ? partnerAlias : 'Chat with strangers'}
            </Text>
            <Text style={{ color: theme.colors.text, fontSize: 11, opacity: 0.75 }}>{subtitle}</Text>
          </View>
          <Pressable onPress={report}>
            <Text style={{ color: theme.colors.primary, fontSize: 13, fontWeight: '800' }}>Report</Text>
          </Pressable>
        </View>

        {/* WAITING */}
        {status === 'waiting' || status === 'connecting' ? (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, gap: 16 }}>
            <View style={{ width: 80, height: 80, borderRadius: 40, borderWidth: 4, borderColor: theme.colors.primary, alignItems: 'center', justifyContent: 'center' }}>
              <Icon.Chat size={40} color={theme.colors.primary} />
            </View>
            <Text style={{ color: theme.colors.text, fontSize: 18, fontWeight: '800', textAlign: 'center' }}>
              {status === 'connecting' ? 'Connecting…' : 'Looking for someone…'}
            </Text>
            <Text style={{ color: theme.colors.text, fontSize: 13, textAlign: 'center', opacity: 0.7 }}>
              You'll be matched with a random guest. Be kind.
            </Text>
            <Pressable onPress={leave} style={{ marginTop: 8, paddingVertical: 12, paddingHorizontal: 24, borderWidth: 2, borderColor: theme.colors.border, borderRadius: 999 }}>
              <Text style={{ color: theme.colors.text, fontWeight: '800' }}>Cancel</Text>
            </Pressable>
          </View>
        ) : (
          <ScrollView
            ref={scrollRef}
            style={{ flex: 1, backgroundColor: theme.chat.bg }}
            contentContainerStyle={{ padding: 12, gap: 3, flexGrow: 1 }}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {messages.length === 0 ? (
              <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                <View style={{ backgroundColor: '#FFFFFF', paddingHorizontal: 18, paddingVertical: 10, borderRadius: 12 }}>
                  <Text style={{ color: '#718096', fontSize: 13 }}>Say hi and start a conversation!</Text>
                </View>
              </View>
            ) : null}

            {messages.map((m) => {
              const mine = m.from === 'me';
              return (
                <View key={m.id} style={{ alignSelf: mine ? 'flex-end' : 'flex-start', maxWidth: '85%' }}>
                  <View style={{
                    backgroundColor: mine ? theme.chat.bubbleOut : theme.chat.bubbleIn,
                    paddingHorizontal: 12, paddingTop: 8, paddingBottom: 6,
                    borderRadius: 18,
                    borderBottomLeftRadius: mine ? 18 : 4,
                    borderBottomRightRadius: mine ? 4 : 18,
                  }}>
                    <Text style={{ color: theme.chat.bubbleText, fontSize: 14, lineHeight: 20 }}>{m.text}</Text>
                    <View style={{ flexDirection: 'row', alignSelf: 'flex-end', gap: 4, marginTop: 3, alignItems: 'center' }}>
                      <Text style={{ color: theme.chat.meta, fontSize: 10 }}>{fmtTime(m.ts)}</Text>
                      {mine ? renderTick(m.status) : null}
                    </View>
                  </View>
                </View>
              );
            })}

            {partnerTyping ? (
              <View style={{ alignSelf: 'flex-start', backgroundColor: theme.chat.bubbleIn, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 18, borderBottomLeftRadius: 4 }}>
                <Text style={{ color: theme.chat.meta, fontSize: 13 }}>{partnerAlias ?? 'They'} is typing…</Text>
              </View>
            ) : null}
          </ScrollView>
        )}

        {/* COMPOSER */}
        {status === 'matched' ? (
          <View style={{
            paddingHorizontal: 12, paddingTop: 10, paddingBottom: Math.max(insets.bottom, 12),
            backgroundColor: theme.colors.bg, borderTopWidth: 1, borderTopColor: theme.colors.border,
            flexDirection: 'row', alignItems: 'center', gap: 8,
          }}>
            <Pressable onPress={next} style={{ paddingHorizontal: 12, paddingVertical: 11, borderRadius: 999, borderWidth: 1, borderColor: theme.colors.border }}>
              <Text style={{ color: theme.colors.text, fontWeight: '800', fontSize: 12 }}>Next</Text>
            </Pressable>
            <TextInput
              value={draft}
              onChangeText={onDraftChange}
              placeholder="Type a message..."
              placeholderTextColor={theme.colors.textMuted}
              maxLength={1000}
              onSubmitEditing={send}
              returnKeyType="send"
              multiline
              style={{
                flex: 1, minHeight: 44, maxHeight: 110,
                color: theme.colors.text, backgroundColor: theme.colors.surface,
                borderWidth: 1, borderColor: theme.colors.border, borderRadius: 24,
                paddingHorizontal: 16, paddingVertical: 10, fontSize: 14,
              }}
            />
            <Pressable onPress={send} style={{ backgroundColor: theme.colors.primary, width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' }}>
              <Icon.Next size={17} color={theme.colors.onPrimary} />
            </Pressable>
          </View>
        ) : null}
      </View>
    </KeyboardAvoidingView>
  );
}
