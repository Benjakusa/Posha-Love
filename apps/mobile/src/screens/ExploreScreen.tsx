import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Pressable,
  ImageBackground,
  FlatList,
  useWindowDimensions,
  StyleSheet,
  Modal,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { useTheme } from '../theme/ThemeProvider';
import { Icon } from '../icons';
import { BottomNav, NavRoute } from '../components/BottomNav';
import { SubscribeSheet } from '../components/SubscribeSheet';
import { listMySubscriptions } from '../api';
import { FEATURED, FEMALE, MALE, TRANS, OTHER, Video } from '../catalog';

type Props = { token: string; onNavigate: (route: NavRoute) => void };

type Category = 'All' | 'Free' | 'Paid' | 'Under 200' | 'Female' | 'Male' | 'Trans' | 'Other';

const CARD_HEIGHT = 260;
const H_PADDING = 24;

const FILTERS: Category[] = ['All', 'Free', 'Paid', 'Under 200', 'Female', 'Male', 'Trans', 'Other'];

export function ExploreScreen({ token, onNavigate }: Props) {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const cardWidth = width - H_PADDING * 2;

  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<Category>('All');
  const [filterOpen, setFilterOpen] = useState(false);
  const [subs, setSubs] = useState<Set<string>>(new Set());
  const [payTarget, setPayTarget] = useState<Video | null>(null);

  useEffect(() => {
    listMySubscriptions(token)
      .then((list) => setSubs(new Set(list.filter((s) => s.status === 'active').map((s) => s.creatorAlias))))
      .catch(() => {});
  }, [token]);

  const matches = (v: Video) => {
    if (query.trim()) {
      const q = query.toLowerCase();
      if (!v.title.toLowerCase().includes(q) && !v.creator.toLowerCase().includes(q)) return false;
    }
    switch (filter) {
      case 'Free': return v.priceMinor === 0;
      case 'Paid': return v.priceMinor > 0;
      case 'Under 200': return v.priceMinor < 20000;
      default: return true;
    }
  };

  const lockedFor = (creator: string) => !subs.has(creator);
  const openPay = (v: Video) => { if (lockedFor(v.creator)) setPayTarget(v); };

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.bg }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
        <View style={{ paddingHorizontal: H_PADDING, paddingTop: insets.top + 16, paddingBottom: 12 }}>
          <Text style={{ color: theme.colors.text, fontSize: theme.fontSizes.xxl, fontWeight: '900' }}>Explore</Text>
          <Text style={{ color: theme.colors.text, fontSize: theme.fontSizes.sm, marginTop: 4, opacity: 0.7 }}>
            Discover creators and their latest videos
          </Text>
        </View>

        <View style={{ paddingHorizontal: H_PADDING, paddingBottom: 16, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', borderWidth: 2, borderColor: theme.colors.border, borderRadius: 999, paddingHorizontal: 16, paddingVertical: 10, gap: 10 }}>
            <Icon.Explore size={18} color={theme.colors.text} />
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="Search creators or videos"
              placeholderTextColor={theme.colors.text}
              style={{ flex: 1, color: theme.colors.text, fontSize: 14, paddingVertical: 2 }}
            />
          </View>
          <Pressable
            onPress={() => setFilterOpen(true)}
            style={{
              width: 46, height: 46, borderRadius: 23,
              borderWidth: 2,
              borderColor: filter !== 'All' ? theme.colors.primary : theme.colors.border,
              alignItems: 'center', justifyContent: 'center',
            }}
          >
            <Icon.Filter size={22} color={filter !== 'All' ? theme.colors.primary : theme.colors.text} />
          </Pressable>
        </View>

        <CarouselSection title="Featured" videos={FEATURED.filter(matches)} theme={theme} subs={subs} onPress={openPay} cardWidth={cardWidth} showFeaturedBadge />
        <CarouselSection title="Female creators" videos={FEMALE.filter(matches)} theme={theme} subs={subs} onPress={openPay} cardWidth={cardWidth} />
        <CarouselSection title="Male creators" videos={MALE.filter(matches)} theme={theme} subs={subs} onPress={openPay} cardWidth={cardWidth} />
        <CarouselSection title="Trans creators" videos={TRANS.filter(matches)} theme={theme} subs={subs} onPress={openPay} cardWidth={cardWidth} />
        <CarouselSection title="Other creators" videos={OTHER.filter(matches)} theme={theme} subs={subs} onPress={openPay} cardWidth={cardWidth} />
      </ScrollView>

      <Modal visible={filterOpen} transparent animationType="fade" onRequestClose={() => setFilterOpen(false)}>
        <Pressable onPress={() => setFilterOpen(false)} style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center' }}>
          <View style={{ backgroundColor: theme.colors.bg, width: '80%', borderRadius: theme.radii.lg, padding: 24, gap: 16, borderWidth: 2, borderColor: theme.colors.border }}>
            <Text style={{ color: theme.colors.text, fontSize: 20, fontWeight: '900', marginBottom: 8 }}>Filters</Text>
            {FILTERS.map((f) => {
              const active = filter === f;
              return (
                <Pressable
                  key={f}
                  onPress={() => { setFilter(f); setFilterOpen(false); }}
                  style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: theme.colors.border }}
                >
                  <Text style={{ color: active ? theme.colors.primary : theme.colors.text, fontSize: 16, fontWeight: active ? '800' : '500' }}>{f}</Text>
                  {active && <Icon.Check size={18} color={theme.colors.primary} />}
                </Pressable>
              );
            })}
          </View>
        </Pressable>
      </Modal>

      <SubscribeSheet
        visible={!!payTarget}
        token={token}
        creatorAlias={payTarget?.creator ?? ''}
        priceMinor={payTarget?.priceMinor ?? 20000}
        onClose={() => setPayTarget(null)}
        onSubscribed={(alias) => {
          setSubs((prev) => new Set(prev).add(alias));
          setPayTarget(null);
        }}
      />

      <BottomNav active="explore" onNavigate={onNavigate} />
    </View>
  );
}

function CarouselSection({
  title,
  videos,
  theme,
  subs,
  onPress,
  cardWidth,
  showFeaturedBadge,
}: {
  title: string;
  videos: Video[];
  theme: ReturnType<typeof useTheme>['theme'];
  subs: Set<string>;
  onPress: (v: Video) => void;
  cardWidth: number;
  showFeaturedBadge?: boolean;
}) {
  const [idx, setIdx] = useState(0);
  const ref = useRef<FlatList<Video>>(null);

  // Randomized per-section cadence: random start delay (0–3s) + random interval (2.5–4.5s).
  // Each section uses its own Math.random() so they never sync.
  useEffect(() => {
    if (videos.length < 2) return;

    let intervalId: ReturnType<typeof setInterval> | null = null;
    const startDelay = Math.floor(Math.random() * 3000);
    const period = 2500 + Math.floor(Math.random() * 2000);

    const startTimeout = setTimeout(() => {
      intervalId = setInterval(() => {
        setIdx((i) => {
          const next = (i + 1) % videos.length;
          ref.current?.scrollToOffset({ offset: next * cardWidth, animated: true });
          return next;
        });
      }, period);
    }, startDelay);

    return () => {
      clearTimeout(startTimeout);
      if (intervalId) clearInterval(intervalId);
    };
  }, [videos.length, cardWidth]);

  if (videos.length === 0) return null;

  return (
    <View style={{ marginBottom: 24 }}>
      <View style={{ paddingHorizontal: H_PADDING, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <Text style={{ color: theme.colors.text, fontSize: theme.fontSizes.lg, fontWeight: '800' }}>{title}</Text>
        <Pressable>
          <Text style={{ color: theme.colors.primary, fontSize: 12, fontWeight: '800' }}>View more</Text>
        </Pressable>
      </View>

      <View style={{ width: cardWidth, alignSelf: 'center', height: CARD_HEIGHT }}>
        <FlatList
          ref={ref}
          data={videos}
          keyExtractor={(v) => v.id}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          snapToInterval={cardWidth}
          decelerationRate="fast"
          getItemLayout={(_, i) => ({ length: cardWidth, offset: cardWidth * i, index: i })}
          onMomentumScrollEnd={(e) => setIdx(Math.round(e.nativeEvent.contentOffset.x / cardWidth))}
          renderItem={({ item }) => {
            const locked = !subs.has(item.creator);
            return (
              <Pressable
                onPress={() => onPress(item)}
                style={{
                  width: cardWidth,
                  height: CARD_HEIGHT,
                  borderRadius: theme.radii.lg,
                  overflow: 'hidden',
                  // NO BORDER — borderless card
                }}
              >
                <ImageBackground source={{ uri: item.image }} style={{ flex: 1, justifyContent: 'flex-end' }} imageStyle={{ backgroundColor: theme.colors.lockedTile }}>
                  <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.45)' }]} />

                  {locked ? <BlurView intensity={90} tint="light" style={StyleSheet.absoluteFill} /> : null}

                  {locked ? (
                    <View
                      style={{
                        position: 'absolute', top: 16, right: 16,
                        width: 44, height: 44, borderRadius: 22,
                        backgroundColor: 'rgba(0,0,0,0.55)',
                        alignItems: 'center', justifyContent: 'center',
                        // NO BORDER on lock badge either
                      }}
                    >
                      <Icon.Lock size={20} color={theme.colors.primary} />
                    </View>
                  ) : null}

                  <View style={{ position: 'absolute', bottom: 16, left: 16, backgroundColor: 'rgba(0,0,0,0.6)', width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' }}>
                    <Icon.Video size={18} color="#FFFFFF" />
                  </View>

                  <View style={{ backgroundColor: 'rgba(0,0,0,0.3)', paddingHorizontal: 16, paddingVertical: 20, paddingLeft: 64, gap: 6 }}>
                    {showFeaturedBadge ? (
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: theme.colors.primary }} />
                        <Text style={{ color: theme.colors.primary, fontSize: 11, fontWeight: '900', letterSpacing: 0.5 }}>FEATURED</Text>
                      </View>
                    ) : null}
                    <Text style={{ color: '#FFFFFF', fontSize: 20, fontWeight: '900' }} numberOfLines={1}>{item.title}</Text>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Text style={{ color: '#FFFFFF', fontSize: 13 }}>{item.creator}</Text>
                      <View style={{ backgroundColor: theme.colors.primary, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999, flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        {locked ? <Icon.Lock size={12} color={theme.colors.onPrimary} /> : <Icon.Unlock size={12} color={theme.colors.onPrimary} />}
                        <Text style={{ color: theme.colors.onPrimary, fontSize: 11, fontWeight: '800' }}>
                          {locked ? `Unlock · ${item.price}` : 'Subscribed'}
                        </Text>
                      </View>
                    </View>
                  </View>
                </ImageBackground>
              </Pressable>
            );
          }}
        />
      </View>

      <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 6, marginTop: 10 }}>
        {videos.map((_, i) => (
          <View key={i} style={{ width: i === idx ? 16 : 6, height: 6, borderRadius: 3, backgroundColor: i === idx ? theme.colors.primary : theme.colors.border }} />
        ))}
      </View>
    </View>
  );
}
