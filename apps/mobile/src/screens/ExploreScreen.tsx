import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  ImageBackground,
  StyleSheet,
  Modal,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { useTheme } from '../theme/ThemeProvider';
import { TopBar } from '../components/TopBar';
import { BottomNav, NavRoute } from '../components/BottomNav';
import { Input } from '../components/Input';
import { Chip } from '../components/Chip';
import { Button } from '../components/Button';
import { ListRow } from '../components/ListRow';
import { SubscribeSheet } from '../components/SubscribeSheet';
import { Icon } from '../icons';
import { listMySubscriptions } from '../api';
import { FEATURED, FEMALE, MALE, TRANS, OTHER, Video } from '../catalog';

type Props = { token: string; onNavigate: (route: NavRoute) => void };

type Category = 'All' | 'Free' | 'Paid' | 'Under 200' | 'Female' | 'Male' | 'Trans' | 'Other';

const FILTERS: Category[] = ['All', 'Free', 'Paid', 'Under 200', 'Female', 'Male', 'Trans', 'Other'];

export function ExploreScreen({ token, onNavigate }: Props) {
  const { theme } = useTheme();
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
      {/* 1. TopBar title style */}
      <TopBar title="Explore" onNotifPress={() => {}} />

      <ScrollView contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
        {/* 2. Search row */}
        <View style={{ paddingHorizontal: 16, paddingTop: 12, paddingBottom: 12, flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <View style={{ flex: 1 }}>
            <Input
              value={query}
              onChangeText={setQuery}
              placeholder="Search creators or videos"
            />
          </View>

          <Pressable
            onPress={() => setFilterOpen(true)}
            accessibilityLabel="Filters"
            style={({ pressed }) => ({
              width: 44,
              height: 44,
              borderRadius: 22,
              backgroundColor: filter !== 'All' ? theme.colors.accentSoft : pressed ? theme.colors.surfaceAlt : theme.colors.surface,
              alignItems: 'center',
              justifyContent: 'center',
            })}
          >
            <Icon.Filter size={20} color={filter !== 'All' ? theme.colors.primary : theme.colors.icon} />
            {filter !== 'All' ? (
              <View
                style={{
                  position: 'absolute',
                  top: 4,
                  right: 8,
                  minWidth: 16,
                  height: 16,
                  borderRadius: 8,
                  backgroundColor: theme.colors.primary,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text style={{ color: theme.colors.onPrimary, fontSize: 11, fontWeight: '600' }}>{filter}</Text>
              </View>
            ) : null}
          </Pressable>

          {/* Chip filters */}
          {filterOpen && (
            <View
              style={{
                position: 'absolute',
                top: 56,
                left: 16,
                right: 16,
                backgroundColor: theme.colors.surface,
                borderRadius: theme.radii.lg,
                padding: 12,
                gap: 8,
                zIndex: 10,
              }}
            >
              {FILTERS.map((f) => (
                <Chip key={f} label={f} selected={filter === f} onPress={() => setFilter(f)} />
              ))}
            </View>
          )}
        </View>

        {/* 3. Category grid */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 12 }}>
          {FEATURED.map((feature) => {
            const videos = (Video as Video[]).filter((v) => v.category === feature);
            return (
              <View key={feature} style={{ marginBottom: 20 }}>
                <View style={{ paddingHorizontal: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                  <Text style={{ color: theme.colors.text, fontSize: 17, fontWeight: '700' }}>{feature}</Text>
                  <Pressable>
                    <Text style={{ color: theme.colors.primaryText, fontSize: 13, fontWeight: '600' }}>See all</Text>
                  </Pressable>
                </View>

                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 12 }}>
                  {videos.map((v) => {
                    const locked = !subs.has(v.creator);
                    return (
                      <Pressable key={v.id} onPress={() => onNavigate(v)} style={{ width: 160, gap: 6 }}>
                        <View style={{ width: 160, aspectRatio: 4 / 5, borderRadius: theme.radii.lg, overflow: 'hidden', backgroundColor: theme.colors.surface }}>
                          <ImageBackground source={{ uri: v.image }} style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                            {locked ? (
                              <>
                <BlurView intensity={90} tint={theme.mode} style={StyleSheet.absoluteFill} />
                <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: theme.colors.scrim, alignItems: 'center', justifyContent: 'center' }}>
                  <Icon.Lock size={16} color={theme.colors.onMedia} />
                </View>
                              </>
                            ) : null}

                            {v.isFeatured ? (
                              <View style={{ position: 'absolute', top: 8, left: 8, backgroundColor: theme.colors.scrim, paddingHorizontal: 8, paddingVertical: 3, borderRadius: theme.radii.pill }}>
                                <Text style={{ color: theme.colors.onMedia, fontSize: 11, fontWeight: '600' }}>Featured</Text>
                              </View>
                            ) : null}
                          </ImageBackground>
                        </View>

                        <Text numberOfLines={1} style={{ color: theme.colors.text, fontSize: 15, fontWeight: '600', lineHeight: 20 }}>
                          {v.title}
                        </Text>
                        <Text numberOfLines={1} style={{ color: theme.colors.textMuted, fontSize: 13, lineHeight: 18 }}>
                          {v.creator}
                        </Text>

                        <View style={{ alignSelf: 'flex-start', backgroundColor: theme.colors.accentSoft, paddingHorizontal: 8, paddingVertical: 2, borderRadius: theme.radii.pill }}>
                          <Text style={{ color: theme.colors.primaryText, fontSize: 12, fontWeight: '600' }}>
                            {locked ? v.price : 'Subscribed'}
                          </Text>
                        </View>
                      </Pressable>
                    );
                  })}
                </ScrollView>
              </View>
            );
          })}
        </ScrollView>

        {/* 5. Footer */}
        <Text style={{ padding: 24, textAlign: 'center', color: theme.colors.textMuted, fontSize: 13 }}>You're all caught up</Text>
      </ScrollView>

      <BottomNav active="explore" onNavigate={onNavigate} />
    </View>
  );
}

function SectionGrid({
  title,
  videos,
  theme,
  subs,
  onPress,
  isFeatured = false,
}: {
  title: string;
  videos: Video[];
  theme: ReturnType<typeof useTheme>['theme'];
  subs: Set<string>;
  onPress: (v: Video) => void;
  isFeatured?: boolean;
}) {
  if (videos.length === 0) return null;

  const width = isFeatured ? 240 : 160;

  return (
    <View style={{ marginBottom: 20 }}>
      <View style={{ paddingHorizontal: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <Text style={{ color: theme.colors.text, fontSize: 17, fontWeight: '700' }}>{title}</Text>
        <Pressable>
          <Text style={{ color: theme.colors.primaryText, fontSize: 13, fontWeight: '600' }}>See all</Text>
        </Pressable>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 12 }}>
        {videos.map((v) => {
          const locked = !subs.has(v.creator);
          return (
            <Pressable key={v.id} onPress={() => onPress(v)} style={{ width, gap: 6 }}>
              <View style={{ width, aspectRatio: 4 / 5, borderRadius: theme.radii.lg, overflow: 'hidden', backgroundColor: theme.colors.surface }}>
                <ImageBackground source={{ uri: v.image }} style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                  {locked ? (
                    <>
          <BlurView intensity={90} tint={theme.mode} style={StyleSheet.absoluteFill} />
          <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: theme.colors.scrim, alignItems: 'center', justifyContent: 'center' }}>
            <Icon.Lock size={16} color={theme.colors.onMedia} />
          </View>
                    </>
                  ) : null}

                  {isFeatured ? (
                    <View style={{ position: 'absolute', top: 8, left: 8, backgroundColor: theme.colors.scrim, paddingHorizontal: 8, paddingVertical: 3, borderRadius: theme.radii.pill }}>
                      <Text style={{ color: theme.colors.onMedia, fontSize: 11, fontWeight: '600' }}>Featured</Text>
                    </View>
                  ) : null}
                </ImageBackground>
              </View>

              <Text numberOfLines={1} style={{ color: theme.colors.text, fontSize: 15, fontWeight: '600', lineHeight: 20 }}>
                {v.title}
              </Text>
              <Text numberOfLines={1} style={{ color: theme.colors.textMuted, fontSize: 13, lineHeight: 18 }}>
                {v.creator}
              </Text>

              <View style={{ alignSelf: 'flex-start', backgroundColor: theme.colors.accentSoft, paddingHorizontal: 8, paddingVertical: 2, borderRadius: theme.radii.pill }}>
                <Text style={{ color: theme.colors.primaryText, fontSize: 12, fontWeight: '600' }}>
                  {locked ? v.price : 'Subscribed'}
                </Text>
              </View>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}
