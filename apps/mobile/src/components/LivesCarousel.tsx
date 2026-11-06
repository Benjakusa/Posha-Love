import React, { useEffect, useRef, useState } from 'react';
import { View, Text, ImageBackground, StyleSheet, Pressable, Animated, useWindowDimensions } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { Icon } from '../icons';

type Live = {
  id: string;
  title: string;
  creator: string;
  in: string;
  image: string;
};

const LIVES: Live[] = [
  { id: 'l1', title: 'Friday vibes', creator: '@amara', in: 'in 2h', image: 'https://images.pexels.com/photos/39569841/pexels-photo-39569841.jpeg?w=900' },
  { id: 'l2', title: 'Q&A hour', creator: '@juma', in: 'in 5h', image: 'https://images.pexels.com/photos/29382377/pexels-photo-29382377.jpeg?w=900' },
  { id: 'l3', title: 'Late talk', creator: '@nia', in: 'tomorrow', image: 'https://images.pexels.com/photos/10563851/pexels-photo-10563851.jpeg?w=900' },
];

export function LivesCarousel({ subs }: { subs: Set<string> }) {
  const { theme } = useTheme();
  const { width } = useWindowDimensions();
  const [idx, setIdx] = useState(0);
  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const timer = setInterval(() => {
      setIdx((i) => (i + 1) % LIVES.length);
    }, 2000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const blink = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0.2, duration: 600, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 1, duration: 600, useNativeDriver: true }),
      ])
    );
    blink.start();
    return () => blink.stop();
  }, [opacity]);

  if (LIVES.length === 0) return null;
  const live = LIVES[idx];
  const isSubscribed = subs.has(live.creator);

  return (
    <View style={{ marginBottom: 24, marginHorizontal: -24 }}>
      <Text style={{ paddingHorizontal: 24, color: theme.colors.text, fontSize: theme.fontSizes.lg, fontWeight: '800', marginBottom: 12, marginTop: 12 }}>
        Lives soon
      </Text>

      {/* FULL-BLEED — no horizontal padding, no card border, no rounded corners */}
      <ImageBackground source={{ uri: live.image }} style={{ width: '100%', height: 320, justifyContent: 'flex-end' }} imageStyle={{ backgroundColor: theme.colors.lockedTile }}>
        {/* Full-image dark overlay */}
        <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.55)' }]} />

        {/* Blinking LIVE badge */}
        <View style={{ position: 'absolute', top: 16, right: 16, flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: theme.colors.primary, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 }}>
          <Animated.View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#FFFFFF', opacity }} />
          <Text style={{ color: theme.colors.onPrimary, fontSize: 11, fontWeight: '900', letterSpacing: 0.5 }}>LIVE</Text>
        </View>

        {/* Bottom text block */}
        <View style={{ padding: 24, gap: 8, backgroundColor: 'rgba(0,0,0,0.35)', paddingBottom: 32 }}>
          <Text style={{ color: '#FFFFFF', fontSize: 24, fontWeight: '900' }}>{live.title}</Text>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
            <Text style={{ color: '#FFFFFF', fontSize: 13 }}>{live.creator} · {live.in}</Text>
            {isSubscribed ? (
              <Pressable style={{ backgroundColor: theme.colors.primary, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 999 }}>
                <Text style={{ color: theme.colors.onPrimary, fontSize: 13, fontWeight: '800' }}>Join</Text>
              </Pressable>
            ) : (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(0,0,0,0.6)', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999, borderWidth: 1, borderColor: theme.colors.primary }}>
                <Icon.Lock size={14} color={theme.colors.primary} />
                <Text style={{ color: theme.colors.primary, fontSize: 13, fontWeight: '800' }}>Subscribers only</Text>
              </View>
            )}
          </View>
        </View>
      </ImageBackground>
    </View>
  );
}
