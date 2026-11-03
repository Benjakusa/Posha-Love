import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
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

// Format message timestamps.
const formatTime = (timestamp: number) => {
  return new Date(timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });
};

export function ChatScreen({ token, onBack }: Props) {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();

  // Dedicated chat palette from POSHA design tokens.
  const chat = theme.chat;

  const [status, setStatus] = useState<
    'connecting' | 'waiting' | 'matched' | 'ended'
  >('connecting');

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

  // SOCKET CONNECTION AND EVENTS
  useEffect(() => {
    const socket = createConnectSocket(token);
    socketRef.current = socket;

    socket.on('connect', () => {
      setStatus('waiting');
      socket.emit('connect:join');
    });

    socket.on('queue:waiting', () => setStatus('waiting'));

    socket.on(
      'session:matched',
      (payload: { partner: { alias: string; online?: boolean } }) => {
        setPartnerAlias(payload.partner.alias);
        setPartnerOnline(payload.partner.online ?? true);
        setPartnerTyping(false);
        setLastSeen(null);
        setMessages([]);
        setStatus('matched');
      },
    );

    socket.on(
      'message:delivered',
      (p: { clientId?: string; serverId: string; ts: number }) => {
        if (!p.clientId) return;

        setMessages((prev) =>
          prev.map((m) =>
            m.id === p.clientId
              ? { ...m, serverId: p.serverId, status: 'delivered' }
              : m,
          ),
        );
      },
    );

    socket.on(
      'message:receive',
      (m: { from: string; text: string; ts: number; serverId: string }) => {
        setMessages((prev) => [
          ...prev,
          {
            id: `${m.ts}-them`,
            serverId: m.serverId,
            from: 'them',
            alias: m.from,
            text: m.text,
            ts: m.ts,
          },
        ]);

        socketRef.current?.emit('message:read', {
          serverIds: [m.serverId],
        });
      },
    );

    socket.on('message:read', (p: { serverIds: string[] }) => {
      setMessages((prev) =>
        prev.map((m) =>
          m.serverId && p.serverIds.includes(m.serverId)
            ? { ...m, status: 'read' }
            : m,
        ),
      );
    });

    socket.on('typing:start', () => setPartnerTyping(true));
    socket.on('typing:stop', () => setPartnerTyping(false));

    socket.on('partner:offline', (p: { lastSeen: number }) => {
      setPartnerOnline(false);
      setPartnerTyping(false);
      setLastSeen(p.lastSeen);
    });

    socket.on('session:ended', () => {
      setStatus('waiting');
      setPartnerAlias(null);
      setPartnerOnline(true);
      setPartnerTyping(false);
      setMessages([]);
      socket.emit('connect:join');
    });

    socket.on('connect:error', () => setStatus('ended'));
    socket.on('disconnect', () => setStatus('connecting'));

    return () => {
      if (typingTimer.current) {
        clearTimeout(typingTimer.current);
      }

      socket.emit('connect:leave');
      socket.disconnect();
      socketRef.current = null;
    };
  }, [token]);

  // AUTOMATICALLY SCROLL TO LATEST MESSAGE
  useEffect(() => {
    const timer = setTimeout(() => {
      scrollRef.current?.scrollToEnd({ animated: true });
    }, 100);

    return () => clearTimeout(timer);
  }, [messages.length, partnerTyping]);

  // TYPING INDICATOR
  const emitTyping = useCallback((typing: boolean) => {
    if (typing === isTyping.current) return;

    isTyping.current = typing;

    socketRef.current?.emit(
      typing ? 'typing:start' : 'typing:stop',
    );
  }, []);

  const onDraftChange = useCallback(
    (text: string) => {
      setDraft(text);

      if (text.length > 0) {
        emitTyping(true);

        if (typingTimer.current) {
          clearTimeout(typingTimer.current);
        }

        typingTimer.current = setTimeout(() => {
          emitTyping(false);
        }, 1500);
      } else {
        emitTyping(false);
      }
    },
    [emitTyping],
  );

  // SEND MESSAGE
  const send = useCallback(() => {
    const text = draft.trim();

    if (!text || !socketRef.current || status !== 'matched') return;

    const clientId = `${Date.now()}-me`;

    socketRef.current.emit('message:send', {
      text,
      clientId,
    });

    setMessages((prev) => [
      ...prev,
      {
        id: clientId,
        from: 'me',
        text,
        ts: Date.now(),
        status: 'sending',
      },
    ]);

    setDraft('');
    emitTyping(false);

    if (typingTimer.current) {
      clearTimeout(typingTimer.current);
    }
  }, [draft, status, emitTyping]);

  // FIND NEXT CHAT PARTNER
  const next = useCallback(() => {
    socketRef.current?.emit('connect:next');

    setStatus('waiting');
    setPartnerAlias(null);
    setPartnerTyping(false);
    setMessages([]);
  }, []);

  // REPORT PARTNER
  const report = useCallback(() => {
    socketRef.current?.emit('session:report');
  }, []);

  // LEAVE CHAT
  const leave = useCallback(() => {
    socketRef.current?.emit('connect:leave');
    onBack();
  }, [onBack]);

  // PARTNER STATUS
  const subtitle = (() => {
    if (status === 'connecting') return 'connecting…';
    if (status === 'waiting') return 'looking for someone';
    if (status === 'ended') return 'disconnected';

    if (!partnerOnline) {
      return lastSeen
        ? `offline · last seen ${formatTime(lastSeen)}`
        : 'offline';
    }

    if (partnerTyping) return 'typing…';

    return 'online';
  })();

  // MESSAGE DELIVERY INDICATOR
  const renderMessageStatus = (messageStatus?: MsgStatus) => {
    if (messageStatus === 'read') {
      return (
        <Text style={{ color: chat.tick, fontSize: 13, fontWeight: '700' }}>
          ✓✓
        </Text>
      );
    }

    if (messageStatus === 'delivered') {
      return (
        <Text
          style={{
            color: chat.tickDelivered,
            fontSize: 13,
            fontWeight: '700',
          }}
        >
          ✓
        </Text>
      );
    }

    return (
      <Text style={{ color: chat.meta, fontSize: 13 }}>
        ·
      </Text>
    );
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={{ flex: 1, backgroundColor: theme.colors.bg }}>

        {/* CHAT HEADER */}
        <View
          style={{
            paddingTop: insets.top + 12,
            paddingBottom: 12,
            paddingHorizontal: 16,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottomWidth: 1,
            borderBottomColor: theme.colors.border,
            backgroundColor: theme.colors.bg,
          }}
        >
          <Pressable onPress={leave} accessibilityLabel="Back">
            <Icon.Back size={26} color={theme.colors.text} />
          </Pressable>

          <View style={{ alignItems: 'center' }}>
            <Text
              style={{
                color: theme.colors.text,
                fontSize: 15,
                fontWeight: '800',
              }}
            >
              {status === 'matched' && partnerAlias
                ? partnerAlias
                : 'Chat with strangers'}
            </Text>

            <Text
              style={{
                color: theme.colors.text,
                fontSize: 11,
                opacity: 0.75,
              }}
            >
              {subtitle}
            </Text>
          </View>

          <Pressable onPress={report} accessibilityLabel="Report">
            <Text
              style={{
                color: theme.colors.primary,
                fontSize: 13,
                fontWeight: '800',
              }}
            >
              Report
            </Text>
          </Pressable>
        </View>

        {/* WAITING / CONNECTING SCREEN */}
        {status === 'waiting' || status === 'connecting' ? (
          <View
            style={{
              flex: 1,
              alignItems: 'center',
              justifyContent: 'center',
              padding: 24,
              gap: 16,
            }}
          >
            <View
              style={{
                width: 80,
                height: 80,
                borderRadius: 40,
                borderWidth: 3,
                borderColor: theme.colors.primary,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Icon.Chat size={40} color={theme.colors.primary} />
            </View>

            <Text
              style={{
                color: theme.colors.text,
                fontSize: 18,
                fontWeight: '800',
                textAlign: 'center',
              }}
            >
              {status === 'connecting'
                ? 'Connecting…'
                : 'Looking for someone…'}
            </Text>

            <Text
              style={{
                color: theme.colors.text,
                fontSize: 13,
                textAlign: 'center',
                opacity: 0.7,
              }}
            >
              You'll be matched with a random guest. Be kind. Report anything
              uncomfortable.
            </Text>

            <Pressable
              onPress={leave}
              style={{
                marginTop: 8,
                paddingVertical: 12,
                paddingHorizontal: 24,
                borderWidth: 2,
                borderColor: theme.colors.border,
                borderRadius: 999,
              }}
            >
              <Text
                style={{
                  color: theme.colors.text,
                  fontWeight: '800',
                }}
              >
                Cancel
              </Text>
            </Pressable>
          </View>
        ) : (

          /* CONVERSATION AREA */
          <ScrollView
            ref={scrollRef}
            style={{
              flex: 1,
              backgroundColor: chat.bg,
            }}
            contentContainerStyle={{
              flexGrow: 1,
              paddingHorizontal: 14,
              paddingVertical: 16,
              gap: 12,
            }}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* EMPTY CONVERSATION */}
            {messages.length === 0 && !partnerTyping ? (
              <View
                style={{
                  flex: 1,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <View
                  style={{
                    backgroundColor: '#FFFFFF',
                    paddingHorizontal: 18,
                    paddingVertical: 10,
                    borderRadius: 12,
                  }}
                >
                  <Text
                    style={{
                      color: '#718096',
                      fontSize: 13,
                    }}
                  >
                    Say hi and start a conversation!
                  </Text>
                </View>
              </View>
            ) : null}

            {/* MESSAGE BUBBLES */}
            {messages.map((m) => {
              const mine = m.from === 'me';

              return (
                <View
                  key={m.id}
                  style={{
                    alignSelf: mine ? 'flex-end' : 'flex-start',
                    maxWidth: '85%',
                  }}
                >
                  <View
                    style={{
                      backgroundColor: mine
                        ? chat.bubbleOut
                        : chat.bubbleIn,

                      paddingHorizontal: 13,
                      paddingTop: 9,
                      paddingBottom: 7,

                      borderRadius: 18,

                      borderBottomLeftRadius: mine ? 18 : 4,
                      borderBottomRightRadius: mine ? 4 : 18,
                    }}
                  >
                    {/* MESSAGE TEXT */}
                    <Text
                      style={{
                        color: chat.bubbleText,
                        fontSize: 14,
                        lineHeight: 21,
                        flexShrink: 1,
                      }}
                    >
                      {m.text}
                    </Text>

                    {/* TIMESTAMP AND DELIVERY STATUS */}
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'flex-end',
                        alignSelf: 'flex-end',
                        gap: 4,
                        marginTop: 4,
                      }}
                    >
                      <Text
                        style={{
                          color: chat.meta,
                          fontSize: 10,
                        }}
                      >
                        {formatTime(m.ts)}
                      </Text>

                      {mine ? renderMessageStatus(m.status) : null}
                    </View>
                  </View>
                </View>
              );
            })}

            {/* PARTNER TYPING INDICATOR */}
            {partnerTyping ? (
              <View
                style={{
                  alignSelf: 'flex-start',
                  backgroundColor: chat.bubbleIn,
                  paddingHorizontal: 14,
                  paddingVertical: 11,
                  borderRadius: 18,
                  borderBottomLeftRadius: 4,
                }}
              >
                <Text
                  style={{
                    color: chat.meta,
                    fontSize: 13,
                  }}
                >
                  {partnerAlias ?? 'They'} is typing…
                </Text>
              </View>
            ) : null}
          </ScrollView>
        )}

        {/* MESSAGE COMPOSER */}
        {status === 'matched' ? (
          <View
            style={{
              paddingHorizontal: 12,
              paddingTop: 10,
              paddingBottom: Math.max(insets.bottom, 12),
              borderTopWidth: 1,
              borderTopColor: theme.colors.border,
              backgroundColor: theme.colors.bg,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 8,
            }}
          >
            {/* NEXT PARTNER */}
            <Pressable
              onPress={next}
              accessibilityLabel="Next"
              style={{
                paddingHorizontal: 12,
                paddingVertical: 11,
                borderRadius: 999,
                borderWidth: 1,
                borderColor: theme.colors.border,
              }}
            >
              <Text
                style={{
                  color: theme.colors.text,
                  fontWeight: '800',
                  fontSize: 12,
                }}
              >
                Next
              </Text>
            </Pressable>

            {/* MESSAGE INPUT */}
            <TextInput
              value={draft}
              onChangeText={onDraftChange}
              placeholder="Type a message..."
              placeholderTextColor={theme.colors.textMuted}
              maxLength={1000}
              onSubmitEditing={send}
              returnKeyType="send"
              multiline={true}
              style={{
                flex: 1,
                minHeight: 44,
                maxHeight: 110,
                color: theme.colors.text,
                backgroundColor: theme.colors.surface,
                borderWidth: 1,
                borderColor: theme.colors.border,
                borderRadius: 24,
                paddingHorizontal: 16,
                paddingVertical: 10,
                fontSize: 14,
              }}
            />

            {/* SEND BUTTON */}
            <Pressable
              onPress={send}
              accessibilityLabel="Send"
              style={{
                backgroundColor: theme.colors.primary,
                width: 44,
                height: 44,
                borderRadius: 22,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Icon.Next
                size={17}
                color={theme.colors.onPrimary}
              />
            </Pressable>
          </View>
        ) : null}
      </View>
    </KeyboardAvoidingView>
  );
}
