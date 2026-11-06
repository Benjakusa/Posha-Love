import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  ImageBackground,
  useWindowDimensions,
} from 'react-native';
import { StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { useTheme } from '../theme/ThemeProvider';
import { Icon } from '../icons';
import { BottomNav, NavRoute } from '../components/BottomNav';
import { LivesCarousel } from '../components/LivesCarousel';
import { HOME_GRID_VIDEOS } from '../catalog';
import { listMySubscriptions } from '../api';

const HERO_IMAGES = [
  'https://images.pexels.com/photos/39569841/pexels-photo-39569841.jpeg?w=1400',
  'https://images.pexels.com/photos/29382377/pexels-photo-29382377.jpeg?w=1400',
  'https://images.pexels.com/photos/17879024/pexels-photo-17879024.jpeg?w=1400',
  'https://images.pexels.com/photos/10563851/pexels-photo-10563851.jpeg?w=1400',
];

const HERO_COPY = [
  'A kind stranger is one tap away.',
  'Talk before you see a face.',
  'Real people. Real conversations.',
  'Leave the moment it stops feeling right.',
];

type Props = {
  token: string;
  onChat: () => void;
  onVideo: () => void;
  onNavigate: (route: NavRoute) => void;
};

export function HomeScreen({ token, onChat, onVideo, onNavigate }: Props) {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  const heroHeight = Math.min(560, Math.round(height * 0.55));
  const [idx, setIdx] = useState(0);
  const [subs, setSubs] = useState<Set<string>>(new Set());
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    timer.current = setInterval(() => setIdx((i) => (i + 1) % HERO_IMAGES.length), 5000);
    return () => { if (timer.current) clearInterval(timer.current); };
  }, []);

  useEffect(() => {
    listMySubscriptions(token)
      .then((list) =>
        setSubs(new Set(list.filter((s) => s.status === 'active').map((s) => s.creatorAlias))),
      )
      .catch(() => {});
  }, [token]);

  return (
    <View style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
        {/* HERO */}
        <ImageBackground
          source={{ uri: HERO_IMAGES[idx] }}
          style={{ height: heroHeight }}
          imageStyle={{ backgroundColor: theme.colors.lockedTile }}
        >
          <View
            style={{
              ...ABS,
              backgroundColor: 'rgba(0,0,0,0.55)',
              paddingTop: Math.max(insets.top + 16, 56),
              paddingHorizontal: 24,
              paddingBottom: 24,
              justifyContent: 'space-between',
            }}
          >
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={{ color: '#FFFFFF', fontSize: 20, fontWeight: '800' }}>👋 Guest</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: theme.colors.primary, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 }}>
                <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: theme.colors.onPrimary }} />
                <Text style={{ color: theme.colors.onPrimary, fontSize: 11, fontWeight: '800', letterSpacing: 0.5 }}>LIVE</Text>
              </View>
            </View>
            <View style={{ gap: 12 }}>
              <View style={{ width: 80, height: 3, backgroundColor: theme.colors.primary }} />
              <Text style={{ color: theme.colors.primary, fontSize: 40, fontWeight: '900', lineHeight: 44, letterSpacing: -0.5 }}>
                {HERO_COPY[idx]}
              </Text>
            </View>
          </View>
        </ImageBackground>

        <View style={{ padding: 24, gap: 24 }}>
          {/* CHAT CARD */}
          <Pressable
            onPress={onChat}
            accessibilityRole="button"
            style={({ pressed }) => ({
              opacity: pressed ? 0.9 : 1,
              backgroundColor: theme.colors.surface,
              borderWidth: 2,
              borderColor: pressed ? theme.colors.primary : theme.colors.border,
              borderRadius: theme.radii.lg,
              padding: 20,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
            })}
          >
            <View style={{ gap: 4, flex: 1 }}>
              <Text style={{ color: theme.colors.text, fontSize: theme.fontSizes.lg, fontWeight: '800' }}>
                Chat with strangers
              </Text>
              <Text style={{ color: theme.colors.text, fontSize: theme.fontSizes.sm }}>
                Text only. Aliases. Report anytime.
              </Text>
            </View>
            <Icon.Chat size={32} color={theme.colors.primary} />
          </Pressable>

          {/* VIDEO CARD */}
          <Pressable
            onPress={onVideo}
            accessibilityRole="button"
            style={({ pressed }) => ({
              opacity: pressed ? 0.9 : 1,
              backgroundColor: '#FF0000',
              borderWidth: 2,
              borderColor: '#FF0000',
              borderRadius: theme.radii.lg,
              padding: 20,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
            })}
          >
            <View style={{ gap: 4, flex: 1 }}>
              <Text style={{ color: '#FFFFFF', fontSize: theme.fontSizes.lg, fontWeight: '800' }}>
                Video chat with strangers
              </Text>
              <Text style={{ color: '#FFFFFF', fontSize: theme.fontSizes.sm }}>
                Guests: 2 min. Subscribers: longer.
              </Text>
            </View>
            <Icon.Video size={32} color="#FFFFFF" />
          </Pressable>

          {/* LIVES CAROUSEL */}
          <LivesCarousel subs={subs} />

          {/* VIDEOS */}
          <View style={{ gap: 12 }}>
            <Text style={{ color: theme.colors.text, fontSize: theme.fontSizes.lg, fontWeight: '800' }}>Videos</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
              {HOME_GRID_VIDEOS.map((v) => {
                const locked = !subs.has(v.creator);
                return (
                  <Pressable
                    key={v.id}
                    style={{
                      width: '48%',
                      borderRadius: theme.radii.md,
                      overflow: 'hidden',
                      borderWidth: 2,
                      borderColor: theme.colors.border,
                      aspectRatio: 0.75,
                    }}
                  >
                    <ImageBackground
                      source={{ uri: v.image }}
                      style={{ flex: 1, justifyContent: 'flex-end' }}
                      imageStyle={{ backgroundColor: theme.colors.lockedTile }}
                    >
                      <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.45)' }]} />
                      {locked ? <BlurView intensity={90} tint="light" style={StyleSheet.absoluteFill} /> : null}
                      {locked ? (
                        <View style={{ position: 'absolute', top: 10, right: 10, width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(0,0,0,0.55)', alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: theme.colors.primary }}>
                          <Icon.Lock size={16} color={theme.colors.primary} />
                        </View>
                      ) : null}
                      <View style={{ position: 'absolute', top: 10, left: 10, backgroundColor: 'rgba(0,0,0,0.6)', width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' }}>
                        <Icon.Video size={14} color="#FFFFFF" />
                      </View>
                      <View style={{ backgroundColor: 'rgba(0,0,0,0.55)', padding: 10, gap: 4 }}>
                        <Text numberOfLines={1} style={{ color: '#FFFFFF', fontSize: 13, fontWeight: '800' }}>
                          {v.title}
                        </Text>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Text numberOfLines={1} style={{ color: '#FFFFFF', fontSize: 11, opacity: 0.85 }}>{v.creator}</Text>
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: theme.colors.primary, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 999 }}>
                            {locked ? <Icon.Lock size={11} color={theme.colors.onPrimary} /> : null}
                            <Text style={{ color: theme.colors.onPrimary, fontSize: 10, fontWeight: '900' }}>
                              {locked ? v.price : 'Subscribed'}
                            </Text>
                          </View>
                        </View>
                      </View>
                    </ImageBackground>
                  </Pressable>
                );
              })}
            </View>
          </View>
        </View>
      </ScrollView>

      <BottomNav active="home" onNavigate={onNavigate} />
    </View>
  );
}

const ABS = { position: 'absolute' as const, top: 0, left: 0, right: 0, bottom: 0 };
