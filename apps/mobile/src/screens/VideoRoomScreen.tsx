import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LiveKitRoom, VideoTrack, useTracks, useLocalParticipant, RoomContext, useRoomContext } from '@livekit/react-native';
import { Track } from 'livekit-client';
import { useTheme } from '../theme/ThemeProvider';

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
     <View style={{ flex: 1, backgroundColor: theme.colors.bg }}>
       <LiveKitRoom
         serverUrl={payload.wsUrl}
         token={payload.token}
         connect={true}
         audio={true}
         video={true}
         onConnected={() => setConnected(true)}
         onDisconnected={onLeave}
         onError={(e) => setError(e.message)}
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
     </View>
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

   // Remote video tracks
   const remoteVideoTracks = useTracks([Track.Source.Camera, Track.Source.Screen]).filter(
     (t) => t.participant.identity !== localParticipant?.identity,
   );

   // Local camera preview
   const localVideoTracks = useTracks([Track.Source.Camera]).filter(
     (t) => t.participant.identity === localParticipant?.identity,
   );

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

   // Countdown
   useEffect(() => {
     if (!connected) return;
     const start = Date.now();
     const id = setInterval(() => {
       const elapsed = Math.floor((Date.now() - start) / 1000);
       const left = Math.max(0, maxSeconds - elapsed);
       setSecondsLeft(left);
       if (left === 0 && !limitHit) {
         setLimitHit(true);
         room?.disconnect().catch(() => undefined);
         onLeave();
       }
     }, 1000);
     return () => clearInterval(id);
   }, [connected, maxSeconds, room, onLeave, limitHit]);

   const formatCountdown = (seconds: number) => {
     const mins = Math.floor(seconds / 60);
     const secs = seconds % 60;
     return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
   };

   return (
     <View style={{ flex: 1, backgroundColor: theme.colors.bg }}>
       <View style={{ position: 'absolute', top: insetsTop + 12, left: 16, right: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
         <View
           style={{
             backgroundColor: theme.colors.scrim,
             paddingHorizontal: 12,
             paddingVertical: 6,
             borderRadius: 999,
           }}
         >
           <Text style={{ color: theme.colors.onMedia, fontWeight: '800', fontSize: 13 }}>
             {formatCountdown(secondsLeft)}
           </Text>
         </View>
         <Pressable
           onPress={onLeave}
           style={{
             backgroundColor: theme.colors.scrim,
             paddingHorizontal: 14,
             paddingVertical: 8,
             borderRadius: 999,
           }}
         >
           <Text style={{ color: theme.colors.onMedia, fontWeight: '800', fontSize: 13 }}>Report</Text>
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
             backgroundColor: theme.colors.bg,
             borderWidth: 2,
             borderColor: theme.colors.iconActive,
           }}
         >
           <VideoTrack trackRef={localTracks[0]} style={{ flex: 1 }} objectFit="cover" />
         </View>
       ) : (
         <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16 }}>
           <ActivityIndicator color={theme.colors.primary} size="large" />
           <Text style={{ color: theme.colors.onMedia, fontSize: 15 }}>Connecting to your stranger…</Text>
         </View>
       )}

       {/* Bottom controls */}
       <View
         style={{
           position: 'absolute',
           bottom: insetsBottom + 24,
           left: 0,
           right: 0,
           flexDirection: 'row',
           justifyContent: 'center',
         }}
       >
         <Pressable
           onPress={toggleMic}
           style={{
             backgroundColor: micOn ? theme.colors.scrim : theme.colors.primary,
             paddingHorizontal: 20,
             paddingVertical: 14,
             borderRadius: 999,
             borderWidth: 2,
             borderColor: theme.colors.onMedia,
           }}
         >
           <Text style={{ color: theme.colors.onMedia, fontWeight: '800', fontSize: 13 }}>{"Mute"}</Text>
         </Pressable>
         <Pressable
           onPress={toggleCam}
           style={{
             backgroundColor: camOn ? theme.colors.scrim : theme.colors.primary,
             paddingHorizontal: 20,
             paddingVertical: 14,
             borderRadius: 999,
             borderWidth: 2,
             borderColor: theme.colors.onMedia,
           }}
         >
           <Text style={{ color: theme.colors.onMedia, fontWeight: '800', fontSize: 13 }}>{"Cam off"}</Text>
         </Pressable>
         <Pressable onPress={onLeave} style={{ backgroundColor: theme.colors.danger, paddingHorizontal: 20, paddingVertical: 14, borderRadius: 999, borderWidth: 2, borderColor: theme.colors.onMedia }}>
           <Text style={{ color: theme.colors.onMedia, fontWeight: '800', fontSize: 13 }}>Leave</Text>
         </Pressable>
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
   const bg = danger ? theme.colors.primary : active ? theme.colors.scrim : theme.colors.bg;
   return (
     <Pressable
       onPress={onPress}
       style={{
         backgroundColor: bg,
         paddingHorizontal: 20,
         paddingVertical: 14,
         borderRadius: 999,
         borderWidth: 2,
         borderColor: theme.colors.onMedia,
       }}
     >
       <Text style={{ color: theme.colors.onMedia, fontWeight: '800', fontSize: 13 }}>{label}</Text>
     </Pressable>
   );
 }
