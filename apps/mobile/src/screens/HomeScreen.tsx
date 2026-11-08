import React, { useEffect, useRef, useState } from 'react';
import {
  View, Text, ScrollView, Pressable, Image, TextInput, ActivityIndicator,
  useWindowDimensions, KeyboardAvoidingView, Platform, Share,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeProvider';
import { BottomNav, NavRoute } from '../components/BottomNav';
import { Icon } from '../icons';
import { PostCard, type FeedPost } from '../components/PostCard';
import { SubscribeSheet } from '../components/SubscribeSheet';
import { SearchFilter, emptyFilters, type Filters } from '../components/SearchFilter';
import { API_BASE } from '../api';

type Live = {
  id: string;
  title: string;
  startsAt: string;
  status: string;
  creator: { handle: string; displayName: string; avatarUrl: string | null } | null;
};

type Props = {
  token: string;
  role: string;
  onChat: () => void;
  onVideo: () => void;
  onNavigate: (route: NavRoute) => void;
};

const HERO_IMAGES = [
  { uri: 'https://images.pexels.com/photos/39569841/pexels-photo-39569841.jpeg?w=1400', text: 'A kind stranger is one tap away.' },
  { uri: 'https://images.pexels.com/photos/29382377/pexels-photo-29382377.jpeg?w=1400', text: 'Talk before you see a face.' },
  { uri: 'https://images.pexels.com/photos/17879024/pexels-photo-17879024.jpeg?w=1400', text: 'Real people. Real conversations.' },
  { uri: 'https://images.pexels.com/photos/10563851/pexels-photo-10563851.jpeg?w=1400', text: 'Leave the moment it stops feeling right.' },
];

function timeAgo(iso: string) {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  return `${Math.floor(diff / 86400)}d`;
}

function liveLabel(l: Live) {
  if (l.status === 'live') return { text: 'LIVE NOW', color: '#FF0000', pulse: true };
  const diff = (new Date(l.startsAt).getTime() - Date.now()) / 1000;
  if (diff < 0) return { text: 'STARTING', color: '#FF0000', pulse: false };
  if (diff < 3600) return { text: `in ${Math.floor(diff / 60)}m`, color: '#0066FF', pulse: false };
  if (diff < 86400) return { text: `in ${Math.floor(diff / 3600)}h`, color: '#0066FF', pulse: false };
  return { text: new Date(l.startsAt).toLocaleDateString(), color: '#0066FF', pulse: false };
}

export function HomeScreen({ token, role, onChat, onVideo, onNavigate }: Props) {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  const heroHeight = Math.min(520, Math.round(height * 0.55));

  const [heroIdx, setHeroIdx] = useState(0);
  const [feed, setFeed] = useState<FeedPost[]>([]);
  const [lives, setLives] = useState<Live[]>([]);
  const [subs, setSubs] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<Filters>(emptyFilters);
  const [payTarget, setPayTarget] = useState<{ creatorId: string; alias: string; priceMinor: number } | null>(null);

  // Light mode: Facebook-style subtle shadow (0 1px 2px rgba(0,0,0,0.2))
  // Dark mode: soft white glow so cards separate from black background
  const shadowStyle = theme.mode === 'light'
    ? {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
        elevation: 2,
      }
    : {
        shadowColor: '#FFFFFF',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.08,
        shadowRadius: 10,
        elevation: 0,
      };

  // Popup / menu / dropdown — stronger layered feel
  const popupShadow = theme.mode === 'light'
    ? {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.12,
        shadowRadius: 12,
        elevation: 6,
      }
    : {
        shadowColor: '#FFFFFF',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.14,
        shadowRadius: 16,
        elevation: 0,
      };

  useEffect(() => {
    const t = setInterval(() => setHeroIdx((i) => (i + 1) % HERO_IMAGES.length), 5000);
    return () => clearInterval(t);
  }, []);

  const buildFeedUrl = (f: Filters) => {
    const params = new URLSearchParams();
    if (f.q) params.set('q', f.q);
    if (f.gender) params.set('gender', f.gender);
    if (f.ethnicity) params.set('ethnicity', f.ethnicity);
    if (f.orientation) params.set('orientation', f.orientation);
    if (f.ageRange) {
      const [min, max] = f.ageRange.split('-').map((s) => s.replace('+', ''));
      if (min) params.set('ageMin', min);
      if (max) params.set('ageMax', max);
    }
    const qs = params.toString();
    return `${API_BASE}/catalog/feed${qs ? '?' + qs : ''}`;
  };

  const loadFeed = async (f: Filters) => {
    try {
      const res = await fetch(buildFeedUrl(f), { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      setFeed(data ?? []);
    } catch {}
  };

  const loadAll = async () => {
    try {
      const [livesRes, subRes] = await Promise.all([
        fetch(`${API_BASE}/catalog/lives`).then((r) => r.json()),
        fetch(`${API_BASE}/subscriptions/entitlements`, { headers: { Authorization: `Bearer ${token}` } }).then((r) => r.ok ? r.json() : []),
      ]);
      setLives(livesRes ?? []);
      setSubs(new Set(subRes ?? []));
      await loadFeed(filters);
    } catch {} finally { setLoading(false); }
  };

  useEffect(() => { loadAll(); }, [token]);

  // Re-fetch feed when filters change (debounce by 300ms)
  useEffect(() => {
    const t = setTimeout(() => loadFeed(filters), 300);
    return () => clearTimeout(t);
  }, [filters]);

  const filteredFeed = feed.filter((p) => {
    if (!p.creator) return false;
    if (filters.q) {
      const q = filters.q.toLowerCase();
      if (!p.creator.handle.toLowerCase().includes(q) && !p.creator.displayName.toLowerCase().includes(q) && !p.caption.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={{ flex: 1, backgroundColor: theme.colors.bg }}>
        <ScrollView contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>

          {/* ===== HERO (full bleed, no card) ===== */}
          <View style={{ height: heroHeight, backgroundColor: '#000' }}>
            <Image source={{ uri: HERO_IMAGES[heroIdx].uri }} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} resizeMode="cover" />
            <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)' }} />
            <View style={{ paddingTop: insets.top + 16, paddingHorizontal: 24, paddingBottom: 24, flex: 1, justifyContent: 'space-between' }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={{ color: '#FFFFFF', fontSize: 18, fontWeight: '900', letterSpacing: 1 }}>POSHA</Text>
                <Pressable onPress={() => onNavigate('settings')} style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon.Settings size={18} color="#FFFFFF" />
                </Pressable>
              </View>
              <View style={{ gap: 12 }}>
                <View style={{ width: 60, height: 3, backgroundColor: theme.colors.primary }} />
                <Text style={{ color: '#FFFFFF', fontSize: 36, fontWeight: '900', lineHeight: 40, letterSpacing: -0.5 }}>
                  {HERO_IMAGES[heroIdx].text}
                </Text>
                <View style={{ flexDirection: 'row', gap: 6 }}>
                  {HERO_IMAGES.map((_, i) => (
                    <View key={i} style={{ width: i === heroIdx ? 20 : 6, height: 6, borderRadius: 3, backgroundColor: i === heroIdx ? theme.colors.primary : '#FFFFFF' }} />
                  ))}
                </View>
              </View>
            </View>
          </View>

          {/* ===== CHAT SECTION (shadow card) ===== */}
          <View style={{ padding: 16 }}>
            <View style={[{ backgroundColor: theme.colors.surface, borderRadius: theme.radii.lg, padding: 20, }, shadowStyle]}>
              <Text style={{ color: theme.colors.text, fontSize: 18, fontWeight: '900', marginBottom: 4 }}>Chat with strangers</Text>
              <Text style={{ color: theme.colors.textMuted, fontSize: 13, marginBottom: 16 }}>Random, aliased, non-explicit. Report anytime.</Text>
              <View style={{ flexDirection: 'row', gap: 10 }}>
                <Pressable onPress={onChat} style={{ flex: 1, backgroundColor: theme.colors.primary, paddingVertical: 14, borderRadius: 999, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 8 }}>
                  <Icon.Chat size={16} color={theme.colors.onPrimary} />
                  <Text style={{ color: theme.colors.onPrimary, fontSize: 14, fontWeight: '900' }}>Text</Text>
                </Pressable>
                <Pressable onPress={onVideo} style={{ flex: 1, backgroundColor: '#FF0000', paddingVertical: 14, borderRadius: 999, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 8 }}>
                  <Icon.Video size={16} color="#FFFFFF" />
                  <Text style={{ color: '#FFFFFF', fontSize: 14, fontWeight: '900' }}>Video</Text>
                </Pressable>
              </View>
            </View>
          </View>

          {/* ===== LIVES SECTION (shadow, 3 accounts + view more) ===== */}
          {lives.length > 0 ? (
            <View style={{ paddingHorizontal: 16, paddingBottom: 16 }}>
              <View style={[{ backgroundColor: theme.colors.surface, borderRadius: theme.radii.lg, padding: 16, }, shadowStyle]}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <Text style={{ color: theme.colors.text, fontSize: 16, fontWeight: '900' }}>Lives</Text>
                  <Pressable onPress={() => onNavigate('explore')}>
                    <Text style={{ color: theme.colors.primary, fontSize: 13, fontWeight: '800' }}>View more →</Text>
                  </Pressable>
                </View>
                {lives.slice(0, 3).map((l) => {
                  const lbl = liveLabel(l);
                  return (
                    <Pressable key={l.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10 }}>
                      <View style={{ width: 44, height: 44, borderRadius: 22, overflow: 'hidden', backgroundColor: theme.colors.primary, alignItems: 'center', justifyContent: 'center' }}>
                        {l.creator?.avatarUrl ? (
                          <Image source={{ uri: l.creator.avatarUrl }} style={{ width: '100%', height: '100%' }} />
                        ) : (
                          <Text style={{ color: theme.colors.onPrimary, fontSize: 15, fontWeight: '900' }}>
                            {(l.creator?.displayName ?? 'C').slice(0, 2).toUpperCase()}
                          </Text>
                        )}
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={{ color: theme.colors.text, fontSize: 14, fontWeight: '800' }}>{l.title}</Text>
                        <Text style={{ color: theme.colors.textMuted, fontSize: 12 }}>@{l.creator?.handle ?? 'creator'}</Text>
                      </View>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: lbl.color, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 999 }}>
                        {lbl.pulse ? <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#FFFFFF' }} /> : null}
                        <Text style={{ color: '#FFFFFF', fontSize: 10, fontWeight: '900' }}>{lbl.text}</Text>
                      </View>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          ) : null}

          {/* ===== CREATOR FEED (Facebook-style posts with comments) ===== */}
          <View style={{ paddingHorizontal: 16, gap: 16 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8, gap: 12 }}>
              <Text style={{ color: theme.colors.text, fontSize: 16, fontWeight: '900' }}>Creator content</Text>
            </View>
            <SearchFilter filters={filters} onChange={setFilters} placeholder="Search creators..." />
            {loading ? (
              <ActivityIndicator color={theme.colors.primary} style={{ padding: 40 }} />
            ) : feed.length === 0 ? (
              <Text style={{ color: theme.colors.textMuted, textAlign: 'center', padding: 24 }}>No posts yet.</Text>
            ) : (
              filteredFeed.map((post) => (
                <PostCard key={post.id} post={post} token={token} subscribed={!!post.creator && subs.has(post.creator.handle)} shadowStyle={shadowStyle} onSubscribe={(c) => setPayTarget({ creatorId: c.id, alias: c.handle, priceMinor: c.subscriptionPriceMinor })} />
              ))
            )}
          </View>
        </ScrollView>

        <SubscribeSheet
          visible={!!payTarget}
          token={token}
          creatorId={payTarget?.creatorId ?? ''}
          creatorAlias={payTarget?.alias ?? ''}
          priceMinor={payTarget?.priceMinor ?? 0}
          onClose={() => setPayTarget(null)}
          onSubscribed={(alias) => {
            setSubs((prev) => new Set(prev).add(alias));
            setPayTarget(null);
          }}
        />

        <BottomNav active="home" onNavigate={onNavigate} />
      </View>
    </KeyboardAvoidingView>
  );
}
