import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, ScrollView, Image, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeProvider';
import { Icon } from '../icons';
import { BottomNav, NavRoute } from '../components/BottomNav';
import { API_BASE } from '../api';

type CreatorProfile = {
  id: string;
  displayName: string;
  handle: string;
  bio: string | null;
  avatarKey: string | null;
  coverKey: string | null;
  avatarUrl: string | null;
  coverUrl: string | null;
  subscriptionPriceMinor: number;
  createdAt: string;
};

type CreatorMe = {
  status: 'pending' | 'approved' | 'rejected';
  application: any;
  profile: CreatorProfile | null;
  content: { videos: any[]; lives: any[] };
  stats: { subscribers: number; earningsMinor: number; videos: number; scheduledLives: number };
} | null;

type Props = {
  token: string;
  alias: string;
  role: string;
  onNavigate: (route: NavRoute) => void;
  onStartCreator: () => void;
  onEditProfile: () => void;
  onSignOut: () => void;
};

async function fetchCreatorMe(token: string): Promise<CreatorMe> {
  try {
    const res = await fetch(`${API_BASE}/creator/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export function ProfileScreen({ token, alias, role, onNavigate, onStartCreator, onEditProfile, onSignOut }: Props) {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const [creator, setCreator] = useState<CreatorMe>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'videos' | 'lives'>('videos');

  useEffect(() => {
    let active = true;
    setLoading(true);
    fetchCreatorMe(token).then(data => {
      if (active) setCreator(data);
    }).finally(() => {
      if (active) setLoading(false);
    });
    return () => { active = false; };
  }, [token]);

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.colors.bg, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color={theme.colors.primary} size="large" />
      </View>
    );
  }

  const isCreator = !!creator?.profile || role === 'creator';
  const profile = creator?.profile;
  const pending = creator?.application;
  const person = profile ?? pending;
  const name = person?.displayName ?? alias;
  const handle = person?.handle ?? alias.toLowerCase();
  const bio = person?.bio ?? '';
  const avatarUrl = person?.avatarUrl ?? null;
  const coverUrl = person?.coverUrl ?? null;
  const price = person?.subscriptionPriceMinor ?? 0;
  const stats = creator?.stats ?? { subscribers: 0, earningsMinor: 0, videos: 0, scheduledLives: 0 };
  const videos = creator?.content?.videos ?? [];
  const lives = creator?.content?.lives ?? [];
  const activeItems = tab === 'videos' ? videos : lives;

  if (isCreator) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.colors.bg }}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 115 }}>
          <View style={{ height: 245, backgroundColor: theme.colors.surface }}>
            {coverUrl ? (
              <Image source={{ uri: coverUrl }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
            ) : (
              <View style={{ flex: 1, backgroundColor: theme.colors.primary }} />
            )}
            <View style={{ position: 'absolute', top: insets.top + 12, left: 20, right: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={{ color: '#FFFFFF', fontSize: 19, fontWeight: '900' }}>POSHA</Text>
              <Pressable onPress={() => onNavigate('settings' as NavRoute)} style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.45)', alignItems: 'center', justifyContent: 'center' }}>
                <Icon.Lock size={19} color="#FFFFFF" />
              </Pressable>
            </View>
          </View>

          <View style={{ paddingHorizontal: 20, marginTop: -54, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' }}>
            <View style={{ width: 108, height: 108, borderRadius: 54, backgroundColor: theme.colors.surface, borderWidth: 4, borderColor: theme.colors.bg, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' }}>
              {avatarUrl ? (
                <Image source={{ uri: avatarUrl }} style={{ width: '100%', height: '100%' }} />
              ) : (
                <Text style={{ color: theme.colors.primary, fontSize: 32, fontWeight: '900' }}>{name.slice(0, 2).toUpperCase()}</Text>
              )}
            </View>
            <Pressable onPress={onEditProfile} style={{ borderWidth: 1, borderColor: theme.colors.border, borderRadius: 999, paddingHorizontal: 20, paddingVertical: 11, marginBottom: 8 }}>
              <Text style={{ color: theme.colors.text, fontSize: 13, fontWeight: '800' }}>Edit profile</Text>
            </Pressable>
          </View>

          <View style={{ paddingHorizontal: 22, paddingTop: 12, gap: 7 }}>
            <Text style={{ color: theme.colors.text, fontSize: 25, fontWeight: '900' }}>{name}</Text>
            <Text style={{ color: theme.colors.primary, fontSize: 14, fontWeight: '700' }}>@{handle}</Text>
            <Text style={{ color: theme.colors.text, fontSize: 14, lineHeight: 21, opacity: 0.82 }}>
              {bio || 'Add a bio to tell your fans more about you.'}
            </Text>
            <Text style={{ color: theme.colors.text, fontSize: 11, opacity: 0.55 }}>
              Creator on POSHA
            </Text>
          </View>

          <View style={{ flexDirection: 'row', marginHorizontal: 20, marginTop: 22, borderTopWidth: 1, borderBottomWidth: 1, borderColor: theme.colors.border, paddingVertical: 17 }}>
            <Stat label="Subscribers" value={stats.subscribers} theme={theme} />
            <Stat label="Videos" value={stats.videos} theme={theme} />
            <Stat label="Scheduled lives" value={stats.scheduledLives} theme={theme} />
          </View>

          <View style={{ marginHorizontal: 20, marginTop: 20, padding: 17, borderWidth: 1, borderColor: theme.colors.border, borderRadius: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View style={{ gap: 5 }}>
              <Text style={{ color: theme.colors.text, fontSize: 12, opacity: 0.65 }}>MONTHLY SUBSCRIPTION</Text>
              <Text style={{ color: theme.colors.text, fontSize: 22, fontWeight: '900' }}>
                {price ? `KSh ${(price / 100).toLocaleString()}` : 'Not set'}
              </Text>
            </View>
            <Text style={{ color: theme.colors.text, fontSize: 12, opacity: 0.6 }}>Per month</Text>
          </View>

          <View style={{ marginTop: 28 }}>
            <View style={{ flexDirection: 'row', paddingHorizontal: 20, borderBottomWidth: 1, borderColor: theme.colors.border }}>
              {(['videos', 'lives'] as const).map(item => (
                <Pressable key={item} onPress={() => setTab(item)} style={{ flex: 1, alignItems: 'center', paddingVertical: 14, borderBottomWidth: tab === item ? 3 : 0, borderBottomColor: theme.colors.primary }}>
                  <Text style={{ color: tab === item ? theme.colors.primary : theme.colors.text, fontSize: 14, fontWeight: '800', textTransform: 'capitalize' }}>{item}</Text>
                </Pressable>
              ))}
            </View>
            {activeItems.length === 0 ? (
              <View style={{ paddingVertical: 42, alignItems: 'center', gap: 10 }}>
                <Icon.Video size={32} color={theme.colors.primary} />
                <Text style={{ color: theme.colors.text, fontSize: 14, fontWeight: '800' }}>Nothing here yet</Text>
                <Text style={{ color: theme.colors.text, fontSize: 12, opacity: 0.6 }}>
                  Your {tab} will appear here.
                </Text>
              </View>
            ) : (
              <View style={{ padding: 16, gap: 10 }}>
                {activeItems.map((item: any, index: number) => (
                  <View key={item.id ?? index} style={{ padding: 14, borderWidth: 1, borderColor: theme.colors.border, borderRadius: 12 }}>
                    <Text style={{ color: theme.colors.text, fontWeight: '700' }}>{item.title ?? (tab === 'videos' ? 'Video' : 'Live session')}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>

          <Pressable onPress={onSignOut} style={{ marginHorizontal: 20, marginTop: 24, paddingVertical: 14, alignItems: 'center', borderWidth: 1, borderColor: theme.colors.border, borderRadius: 999 }}>
            <Text style={{ color: theme.colors.text, fontWeight: '800' }}>Sign out</Text>
          </Pressable>
        </ScrollView>
        <BottomNav active="profile" onNavigate={onNavigate} />
      </View>
    );
  }

  const initials = (alias || 'GU').replace(/[^A-Za-z0-9]/g, '').slice(-2).toUpperCase();

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.bg }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
        <View style={{ height: 220, backgroundColor: theme.colors.primary, justifyContent: 'flex-end', padding: 24, paddingTop: insets.top + 16 }}>
          <Text style={{ color: '#FFFFFF', fontSize: 28, fontWeight: '900' }}>Your space.</Text>
          <Text style={{ color: '#FFFFFF', fontSize: 15, opacity: 0.85 }}>Connect with creators and discover content.</Text>
        </View>
        <View style={{ padding: 24, gap: 20 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 15 }}>
            <View style={{ width: 66, height: 66, borderRadius: 33, backgroundColor: theme.colors.primary, alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ color: theme.colors.onPrimary, fontSize: 23, fontWeight: '900' }}>{initials}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: theme.colors.text, fontSize: 19, fontWeight: '900' }}>{alias}</Text>
              <Text style={{ color: theme.colors.text, fontSize: 12, opacity: 0.65 }}>{role === 'guest' ? 'Guest account' : 'Member'}</Text>
            </View>
          </View>
          <Pressable onPress={onStartCreator} style={{ backgroundColor: theme.colors.primary, padding: 16, borderRadius: 999, alignItems: 'center' }}>
            <Text style={{ color: theme.colors.onPrimary, fontWeight: '900' }}>Become a creator</Text>
          </Pressable>
          <Text style={{ color: theme.colors.text, fontSize: 16, fontWeight: '800' }}>My subscriptions</Text>
          <Text style={{ color: theme.colors.text, fontSize: 13, opacity: 0.7 }}>You haven't subscribed to any creator yet.</Text>
          <Pressable onPress={onSignOut} style={{ borderWidth: 1, borderColor: theme.colors.border, borderRadius: 999, padding: 14, alignItems: 'center' }}>
            <Text style={{ color: theme.colors.text, fontWeight: '800' }}>Sign out</Text>
          </Pressable>
        </View>
      </ScrollView>
      <BottomNav active="profile" onNavigate={onNavigate} />
    </View>
  );
}

function Stat({ label, value, theme }: { label: string; value: number; theme: ReturnType<typeof useTheme>['theme'] }) {
  return (
    <View style={{ flex: 1, alignItems: 'center', gap: 5 }}>
      <Text style={{ color: theme.colors.text, fontSize: 21, fontWeight: '900' }}>{value.toLocaleString()}</Text>
      <Text style={{ color: theme.colors.text, fontSize: 10, opacity: 0.6, textAlign: 'center' }}>{label}</Text>
    </View>
  );
}
