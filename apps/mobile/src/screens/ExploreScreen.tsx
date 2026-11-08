import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, Pressable, Image, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeProvider';
import { BottomNav, NavRoute } from '../components/BottomNav';
import { SearchFilter, emptyFilters, type Filters } from '../components/SearchFilter';
import { Icon } from '../icons';
import { API_BASE } from '../api';

type Creator = {
  id: string;
  userId: string;
  handle: string;
  displayName: string;
  bio: string | null;
  gender: string | null;
  ethnicity: string | null;
  orientation: string | null;
  ageMin: number | null;
  ageMax: number | null;
  avatarUrl: string | null;
  coverUrl: string | null;
  subscriptionPriceMinor: number;
};

type Props = {
  token: string;
  onNavigate: (route: NavRoute) => void;
  onOpenCreator: (handle: string) => void;
};

export function ExploreScreen({ token, onNavigate, onOpenCreator }: Props) {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const [filters, setFilters] = useState<Filters>(emptyFilters);
  const [creators, setCreators] = useState<Creator[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (filters.q) params.set('q', filters.q);
        if (filters.gender) params.set('gender', filters.gender);
        if (filters.ethnicity) params.set('ethnicity', filters.ethnicity);
        if (filters.orientation) params.set('orientation', filters.orientation);
        if (filters.ageRange) {
          const [min, max] = filters.ageRange.split('-').map((s) => s.replace('+', ''));
          if (min) params.set('ageMin', min);
          if (max) params.set('ageMax', max);
        }
        const qs = params.toString();
        const res = await fetch(`${API_BASE}/catalog/creators${qs ? '?' + qs : ''}`);
        const data = await res.json();
        setCreators(data ?? []);
      } catch {} finally { setLoading(false); }
    }, 300);
    return () => clearTimeout(t);
  }, [filters]);

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.bg }}>
      <View style={{ paddingTop: insets.top + 12, paddingHorizontal: 16, paddingBottom: 8 }}>
        <Text style={{ color: theme.colors.text, fontSize: 28, fontWeight: '900', marginBottom: 12 }}>Explore</Text>
        <SearchFilter filters={filters} onChange={setFilters} placeholder="Search creators..." />
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
        {loading ? (
          <ActivityIndicator color={theme.colors.primary} style={{ padding: 40 }} />
        ) : creators.length === 0 ? (
          <Text style={{ color: theme.colors.textMuted, textAlign: 'center', padding: 40 }}>No creators match your filters.</Text>
        ) : (
          <View style={{ gap: 12 }}>
            {creators.map((c) => (
              <Pressable
                key={c.id}
                onPress={() => onOpenCreator(c.handle)}
                style={({ pressed }) => ({
                  opacity: pressed ? 0.85 : 1,
                  flexDirection: 'row',
                  gap: 14,
                  padding: 14,
                  backgroundColor: theme.colors.surface,
                  borderRadius: theme.radii.lg,
                  shadowColor: theme.mode === 'light' ? '#000' : '#FFF',
                  shadowOffset: { width: 0, height: theme.mode === 'light' ? 1 : 0 },
                  shadowOpacity: theme.mode === 'light' ? 0.08 : 0.06,
                  shadowRadius: theme.mode === 'light' ? 4 : 10,
                  elevation: theme.mode === 'light' ? 2 : 0,
                })}
              >
                <View style={{ width: 64, height: 64, borderRadius: 32, overflow: 'hidden', backgroundColor: theme.colors.primary, alignItems: 'center', justifyContent: 'center' }}>
                  {c.avatarUrl ? (
                    <Image source={{ uri: c.avatarUrl }} style={{ width: '100%', height: '100%' }} />
                  ) : (
                    <Text style={{ color: theme.colors.onPrimary, fontSize: 22, fontWeight: '900' }}>
                      {c.displayName.slice(0, 2).toUpperCase()}
                    </Text>
                  )}
                </View>
                <View style={{ flex: 1, gap: 4 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text style={{ color: theme.colors.text, fontSize: 16, fontWeight: '900' }} numberOfLines={1}>{c.displayName}</Text>
                    <View style={{ backgroundColor: theme.colors.primary, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999 }}>
                      <Text style={{ color: theme.colors.onPrimary, fontSize: 11, fontWeight: '900' }}>
                        KSh {(c.subscriptionPriceMinor / 100).toFixed(0)}/mo
                      </Text>
                    </View>
                  </View>
                  <Text style={{ color: theme.colors.textMuted, fontSize: 12 }}>@{c.handle}</Text>
                  {c.bio ? (
                    <Text style={{ color: theme.colors.text, fontSize: 13 }} numberOfLines={2}>{c.bio}</Text>
                  ) : null}
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginTop: 4 }}>
                    {[c.gender, c.ethnicity, c.orientation].filter(Boolean).map((tag) => (
                      <View key={tag} style={{ backgroundColor: theme.mode === 'light' ? '#F0F2F5' : theme.colors.surface, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 999 }}>
                        <Text style={{ color: theme.colors.text, fontSize: 10, fontWeight: '700', textTransform: 'capitalize' }}>{tag}</Text>
                      </View>
                    ))}
                    {c.ageMin && c.ageMax ? (
                      <View style={{ backgroundColor: theme.mode === 'light' ? '#F0F2F5' : theme.colors.surface, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 999 }}>
                        <Text style={{ color: theme.colors.text, fontSize: 10, fontWeight: '700' }}>{c.ageMin}–{c.ageMax}</Text>
                      </View>
                    ) : null}
                  </View>
                </View>
              </Pressable>
            ))}
          </View>
        )}
      </ScrollView>

      <BottomNav active="explore" onNavigate={onNavigate} />
    </View>
  );
}
