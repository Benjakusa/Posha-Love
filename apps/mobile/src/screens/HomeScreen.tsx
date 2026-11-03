import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  ImageBackground,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeProvider';
import { Icon } from '../icons';

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
  onChat: () => void;
  onVideo: () => void;
  onProfile: () => void;
  onSettings: () => void;
  onExplore: () => void;
  onHome: () => void;
};

export function HomeScreen({ onChat, onVideo, onProfile, onSettings, onExplore, onHome }: Props) {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  const heroHeight = Math.min(560, Math.round(height * 0.55));
  const [idx, setIdx] = useState(0);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    timer.current = setInterval(() => setIdx((i) => (i + 1) % HERO_IMAGES.length), 5000);
    return () => { if (timer.current) clearInterval(timer.current); };
  }, []);

  const lives = [
    { id: 'l1', title: 'Friday vibes', creator: '@amara', in: 'in 2h' },
    { id: 'l2', title: 'Q&A hour', creator: '@juma', in: 'in 5h' },
    { id: 'l3', title: 'Late talk', creator: '@nia', in: 'tomorrow' },
  ];
  const videos = [
    { id: 'v1', title: 'Late night talk', creator: '@amara', price: 'KSh 200' },
    { id: 'v2', title: 'Coffee & questions', creator: '@juma', price: 'KSh 150' },
    { id: 'v3', title: 'Sunday thoughts', creator: '@nia', price: 'KSh 300' },
    { id: 'v4', title: 'Street sounds', creator: '@kev', price: 'KSh 100' },
  ];

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
                <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#FFFFFF' }} />
                <Text style={{ color: '#FFFFFF', fontSize: 11, fontWeight: '800', letterSpacing: 0.5 }}>LIVE</Text>
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
                Video chat with strangers
              </Text>
              <Text style={{ color: theme.colors.text, fontSize: theme.fontSizes.sm }}>
                Guests: 2 min. Subscribers: longer.
              </Text>
            </View>
            <Icon.Video size={32} color={theme.colors.primary} />
          </Pressable>

          {/* LIVES SOON */}
          <View style={{ gap: 12 }}>
            <Text style={{ color: theme.colors.text, fontSize: theme.fontSizes.lg, fontWeight: '800' }}>Lives soon</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12 }}>
              {lives.map((l) => (
                <View
                  key={l.id}
                  style={{
                    width: 220,
                    backgroundColor: theme.colors.surface,
                    borderWidth: 2,
                    borderColor: theme.colors.border,
                    borderLeftWidth: 4,
                    borderLeftColor: theme.colors.primary,
                    borderRadius: theme.radii.lg,
                    padding: 16,
                    gap: 8,
                  }}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: theme.colors.primary }} />
                    <Text style={{ color: theme.colors.primary, fontSize: 11, fontWeight: '800', letterSpacing: 0.5 }}>LIVE</Text>
                  </View>
                  <Text style={{ color: theme.colors.text, fontSize: theme.fontSizes.md, fontWeight: '800' }}>{l.title}</Text>
                  <Text style={{ color: theme.colors.text, fontSize: theme.fontSizes.sm }}>{l.creator}</Text>
                  <Text style={{ color: theme.colors.text, fontSize: theme.fontSizes.xs }}>{l.in}</Text>
                </View>
              ))}
            </ScrollView>
          </View>

          {/* VIDEOS */}
          <View style={{ gap: 12 }}>
            <Text style={{ color: theme.colors.text, fontSize: theme.fontSizes.lg, fontWeight: '800' }}>Videos</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
              {videos.map((v) => (
                <View key={v.id} style={{ width: '48%', gap: 8 }}>
                  <View
                    style={{
                      aspectRatio: 1,
                      backgroundColor: theme.colors.lockedTile,
                      borderRadius: theme.radii.md,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Icon.Lock size={28} color={theme.colors.primary} />
                  </View>
                  <Text numberOfLines={1} style={{ color: theme.colors.text, fontSize: theme.fontSizes.sm, fontWeight: '700' }}>
                    {v.title}
                  </Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Text style={{ color: theme.colors.text, fontSize: theme.fontSizes.xs }}>{v.creator}</Text>
                    <View style={{ backgroundColor: theme.colors.primary, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 999 }}>
                      <Text style={{ color: '#FFFFFF', fontSize: 11, fontWeight: '800' }}>{v.price}</Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>

      {/* FIXED BOTTOM NAV */}
      <View
        style={{
          position: 'absolute',
          left: 0, right: 0, bottom: 0,
          backgroundColor: theme.colors.bg,
          borderTopWidth: 2,
          borderTopColor: theme.colors.border,
          flexDirection: 'row',
          justifyContent: 'space-around',
          paddingTop: 12,
          paddingBottom: Math.max(insets.bottom, 16) + 8,
        }}
      >
        <NavItem label="Home" icon={<Icon.Home size={22} color={theme.colors.primary} />} active onPress={onHome} textColor={theme.colors.primary} />
        <NavItem label="Explore" icon={<Icon.Explore size={22} />} onPress={onExplore} textColor={theme.colors.text} />
        <NavItem label="Profile" icon={<Icon.User size={22} />} onPress={onProfile} textColor={theme.colors.text} />
        <NavItem label="Settings" icon={<Icon.Settings size={22} />} onPress={onSettings} textColor={theme.colors.text} />
      </View>
    </View>
  );
}

function NavItem({ label, icon, onPress, active, textColor }: { label: string; icon: React.ReactNode; onPress: () => void; active?: boolean; textColor: string }) {
  return (
    <Pressable onPress={onPress} accessibilityLabel={label} style={{ alignItems: 'center', gap: 4 }}>
      {icon}
      <Text style={{ fontSize: 11, color: textColor, fontWeight: '700' }}>{label}</Text>
      {active ? <View style={{ width: 20, height: 2, backgroundColor: '#FF0000', marginTop: 2 }} /> : null}
    </Pressable>
  );
}

const ABS = { position: 'absolute' as const, top: 0, left: 0, right: 0, bottom: 0 };
