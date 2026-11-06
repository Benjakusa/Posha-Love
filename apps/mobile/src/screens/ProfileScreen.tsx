import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, ScrollView, Image, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeProvider';
import { TopBar } from '../components/TopBar';
import { BottomNav, NavRoute } from '../components/BottomNav';
import { Avatar } from '../components/Avatar';
import { Button } from '../components/Button';
import { ListRow } from '../components/ListRow';
import { Icon } from '../icons';
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
    fetchCreatorMe(token).then((data) => {
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
        <TopBar onSearchPress={() => onNavigate('explore')} onNotifPress={() => {}} />

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
          {/* Cover photo */}
          <View style={{ height: 180, backgroundColor: theme.colors.surface }}>
            {coverUrl ? (
              <Image source={{ uri: coverUrl }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
            ) : null}
          </View>

          {/* Profile header row */}
          <View style={{ paddingHorizontal: 16, marginTop: -48, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' }}>
            <View style={{ borderRadius: 50, borderWidth: 4, borderColor: theme.colors.bg, overflow: 'hidden' }}>
              <Avatar uri={avatarUrl} name={name} size={96} />
            </View>

            <Button label="Edit profile" variant="secondary" onPress={onEditProfile} minHeight={38} />
          </View>

          {/* Info block */}
          <View style={{ paddingHorizontal: 16, paddingTop: 12, gap: 4 }}>
            <Text style={{ color: theme.colors.text, fontSize: 20, fontWeight: '700', lineHeight: 24 }}>{name}</Text>
            <Text style={{ color: theme.colors.primaryText, fontSize: 13, fontWeight: '600' }}>@{handle}</Text>
            {bio ? (
              <Text style={{ color: theme.colors.textMuted, fontSize: 15, lineHeight: 21, marginTop: 4 }}>
                {bio}
              </Text>
            ) : null}
          </View>

          {/* Stats row */}
          <View style={{ flexDirection: 'row', marginHorizontal: 16, marginTop: 16, borderTopWidth: 1, borderBottomWidth: 1, borderColor: theme.colors.divider, paddingVertical: 12 }}>
            <Stat label="Subscribers" value={stats.subscribers} theme={theme} />
            <Stat label="Videos" value={stats.videos} theme={theme} />
            <Stat label="Scheduled" value={stats.scheduledLives} theme={theme} />
          </View>

          {/* Subscription card */}
          <View style={{ marginHorizontal: 16, marginTop: 16, padding: 12, backgroundColor: theme.colors.surface, borderRadius: theme.radii.lg, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View style={{ gap: 2 }}>
              <Text style={{ color: theme.colors.textMuted, fontSize: 12, fontWeight: '600' }}>MONTHLY SUBSCRIPTION</Text>
              <Text style={{ color: theme.colors.text, fontSize: 17, fontWeight: '700' }}>
                {price ? `KSh ${(price / 100).toLocaleString()}` : 'Not set'}
              </Text>
            </View>
            <Text style={{ color: theme.colors.textMuted, fontSize: 13 }}>Per month</Text>
          </View>

          {/* Tabs & Content */}
          <View style={{ marginTop: 20 }}>
            <View style={{ flexDirection: 'row', paddingHorizontal: 16, borderBottomWidth: 1, borderColor: theme.colors.divider }}>
              {(['videos', 'lives'] as const).map((item) => (
                <Pressable key={item} onPress={() => setTab(item)} style={{ flex: 1, alignItems: 'center', paddingVertical: 12, borderBottomWidth: tab === item ? 2 : 0, borderBottomColor: theme.colors.primary }}>
                  <Text style={{ color: tab === item ? theme.colors.primaryText : theme.colors.textMuted, fontSize: 15, fontWeight: '600', textTransform: 'capitalize' }}>{item}</Text>
                </Pressable>
              ))}
            </View>

            {activeItems.length === 0 ? (
              <View style={{ paddingVertical: 40, alignItems: 'center', gap: 8 }}>
                <Icon.Video size={32} color={theme.colors.icon} />
                <Text style={{ color: theme.colors.text, fontSize: 15, fontWeight: '600' }}>Nothing here yet</Text>
                <Text style={{ color: theme.colors.textMuted, fontSize: 13 }}>
                  Your {tab} will appear here.
                </Text>
              </View>
            ) : (
              <View style={{ padding: 16, gap: 8 }}>
                {activeItems.map((item: any, index: number) => (
                  <ListRow key={item.id ?? index} title={item.title ?? (tab === 'videos' ? 'Video' : 'Live session')} showChevron={false} showDivider={index < activeItems.length - 1} />
                ))}
              </View>
            )}
          </View>

          <View style={{ paddingHorizontal: 16, marginTop: 24 }}>
            <Button label="Sign out" variant="tertiary" onPress={onSignOut} />
          </View>
        </ScrollView>

        <BottomNav active="profile" onNavigate={onNavigate} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.bg }}>
      <TopBar onSearchPress={() => onNavigate('explore')} onNotifPress={() => {}} />

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 100, gap: 16 }} showsVerticalScrollIndicator={false}>
        {/* User Card */}
        <View style={{ backgroundColor: theme.colors.surface, borderRadius: theme.radii.lg, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 16 }}>
          <Avatar name={alias} size={56} />
          <View style={{ flex: 1, gap: 2 }}>
            <Text style={{ color: theme.colors.text, fontSize: 17, fontWeight: '700', lineHeight: 22 }}>{alias}</Text>
            <Text style={{ color: theme.colors.textMuted, fontSize: 13 }}>{role === 'guest' ? 'Guest account' : 'Member'}</Text>
          </View>
        </View>

        <Button label="Become a creator" onPress={onStartCreator} minHeight={48} />

        <View style={{ gap: 8, marginTop: 8 }}>
          <Text style={{ color: theme.colors.text, fontSize: 17, fontWeight: '700' }}>My subscriptions</Text>
          <Text style={{ color: theme.colors.textMuted, fontSize: 13 }}>You haven't subscribed to any creator yet.</Text>
        </View>

        <View style={{ marginTop: 24 }}>
          <Button label="Sign out" variant="tertiary" onPress={onSignOut} />
        </View>
      </ScrollView>

      <BottomNav active="profile" onNavigate={onNavigate} />
    </View>
  );
}

function Stat({ label, value, theme }: { label: string; value: number; theme: ReturnType<typeof useTheme>['theme'] }) {
  return (
    <View style={{ flex: 1, alignItems: 'center', gap: 2 }}>
      <Text style={{ color: theme.colors.text, fontSize: 17, fontWeight: '700' }}>{value.toLocaleString()}</Text>
      <Text style={{ color: theme.colors.textMuted, fontSize: 12, textAlign: 'center' }}>{label}</Text>
    </View>
  );
}
