import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  LiveKitRoom,
  VideoTrack,
  useTracks,
  useLocalParticipant,
  RoomContext,
  useRoomContext,
} from '@livekit/react-native';
import { Track } from 'livekit-client';
import { useTheme } from '../theme/ThemeProvider';
import { Icon } from '../icons';

type TokenPayload = {
  wsUrl: string;
  token: string;
  roomName: string;
  maxSeconds: number;
};

type Props = {
  payload: TokenPayload;
  onLeave: () => void;
};

export function VideoRoomScreen({ payload, onLeave }: Props) {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <LiveKitRoom
      serverUrl={payload.wsUrl}
      token={payload.token}
      connect={true}
      audio={true}
      video={true}
      onConnected={() => setConnected(true)}
      onDisconnected={onLeave}
      onError={(e) => setError(e.message)}
      style={{ flex: 1, backgroundColor: '#000' }}
    >
      <RoomView
        insetsTop={insets.top}
        insetsBottom={insets.bottom}
        connected={connected}
        error={error}
        maxSeconds={payload.maxSeconds}
        onLeave={onLeave}
        theme={theme}
      />
    </LiveKitRoom>
  );
}

function RoomView({
  insetsTop,
  insetsBottom,
  connected,
  error,
  maxSeconds,
  onLeave,
  theme,
}: {
  insetsTop: number;
  insetsBottom: number;
  connected: boolean;
  error: string | null;
  maxSeconds: number;
  onLeave: () => void;
  theme: ReturnType<typeof useTheme>['theme'];
}) {
  const room = useRoomContext();
  const { localParticipant } = useLocalParticipant();
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [secondsLeft, setSecondsLeft] = useState(maxSeconds);
  const [limitHit, setLimitHit] = useState(false);

  // Remote video tracks
  const remoteTracks = useTracks([Track.Source.Camera]).filter(
    (t) => t.participant.identity !== localParticipant?.identity,
  );

  // Local camera preview
  const localTracks = useTracks([Track.Source.Camera]).filter(
    (t) => t.participant.identity === localParticipant?.identity,
  );

  // Countdown (server is source of truth, this is display-only)
  useEffect(() => {
    if (!connected) return;
    const start = Date.now();
    const id = setInterval(() => {
      const elapsed = Math.floor((Date.now() - start) / 1000);
      const left = Math.max(0, maxSeconds - elapsed);
      setSecondsLeft(left);
      if (left === 0 && !limitHit) {
        setLimitHit(true);
        // server will disconnect us within ~1s, but be explicit
        room?.disconnect().catch(() => undefined);
        onLeave();
      }
    }, 1000);
    return () => clearInterval(id);
  }, [connected, maxSeconds, room, onLeave, limitHit]);

  const toggleMic = async () => {
    if (!localParticipant) return;
    const next = !micOn;
    await localParticipant.setMicrophoneEnabled(next);
    setMicOn(next);
  };

  const toggleCam = async () => {
    if (!localParticipant) return;
    const next = !camOn;
    await localParticipant.setCameraEnabled(next);
    setCamOn(next);
  };

  const mm = String(Math.floor(secondsLeft / 60)).padStart(2, '0');
  const ss = String(secondsLeft % 60).padStart(2, '0');

  return (
    <View style={{ flex: 1 }}>
      {/* Remote video full-screen */}
      {remoteTracks.length > 0 ? (
        <VideoTrack
          trackRef={remoteTracks[0]}
          style={{ flex: 1 }}
          objectFit="cover"
        />
      ) : (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16 }}>
          <ActivityIndicator color="#FFFFFF" size="large" />
          <Text style={{ color: '#FFFFFF', fontSize: 15 }}>
            {error ?? 'Connecting to your stranger…'}
          </Text>
        </View>
      )}

      {/* Top HUD */}
      <View
        style={{
          position: 'absolute',
          top: insetsTop + 12,
          left: 16,
          right: 16,
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <View
          style={{
            backgroundColor: 'rgba(0,0,0,0.6)',
            paddingHorizontal: 12,
            paddingVertical: 6,
            borderRadius: 999,
          }}
        >
          <Text style={{ color: '#FFFFFF', fontWeight: '800', fontSize: 13 }}>
            {mm}:{ss} left
          </Text>
        </View>
        <Pressable
          onPress={onLeave}
          style={{
            backgroundColor: 'rgba(0,0,0,0.6)',
            paddingHorizontal: 14,
            paddingVertical: 8,
            borderRadius: 999,
          }}
        >
          <Text style={{ color: '#FFFFFF', fontWeight: '800', fontSize: 13 }}>Report</Text>
        </Pressable>
      </View>

      {/* Local PiP */}
      {localTracks.length > 0 ? (
        <View
          style={{
            position: 'absolute',
            right: 16,
            top: insetsTop + 64,
            width: 110,
            height: 150,
            borderRadius: 14,
            overflow: 'hidden',
            backgroundColor: '#000',
            borderWidth: 2,
            borderColor: '#FFFFFF',
          }}
        >
          <VideoTrack trackRef={localTracks[0]} style={{ flex: 1 }} objectFit="cover" />
        </View>
      ) : null}

      {/* Bottom controls */}
      <View
        style={{
          position: 'absolute',
          bottom: insetsBottom + 24,
          left: 0,
          right: 0,
          flexDirection: 'row',
          justifyContent: 'center',
          gap: 20,
        }}
      >
        <ControlButton label={micOn ? 'Mute' : 'Unmute'} onPress={toggleMic} active={micOn} theme={theme} />
        <ControlButton label={camOn ? 'Cam off' : 'Cam on'} onPress={toggleCam} active={camOn} theme={theme} />
        <ControlButton label="Leave" onPress={onLeave} danger theme={theme} />
      </View>
    </View>
  );
}

function ControlButton({
  label,
  onPress,
  active,
  danger,
  theme,
}: {
  label: string;
  onPress: () => void;
  active?: boolean;
  danger?: boolean;
  theme: ReturnType<typeof useTheme>['theme'];
}) {
  const bg = danger ? theme.palette.red : active ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.6)';
  return (
    <Pressable
      onPress={onPress}
      style={{
        backgroundColor: bg,
        paddingHorizontal: 20,
        paddingVertical: 14,
        borderRadius: 999,
        borderWidth: 2,
        borderColor: '#FFFFFF',
      }}
    >
      <Text style={{ color: '#FFFFFF', fontWeight: '800', fontSize: 13 }}>{label}</Text>
    </Pressable>
  );
}
