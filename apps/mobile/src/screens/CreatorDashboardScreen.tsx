import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, Pressable, Image, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeProvider';
import { Icon } from '../icons';
import { API_BASE } from '../api';

type Props = {
  token: string;
  creatorStatus: 'approved' | 'pending' | 'rejected' | 'none';
  onEditProfile: () => void;
  onCompleteProfile: () => void;
  onBrowse: () => void;
  onSignOut: () => void;
};

type Me = {
  status: string;
  profile: {
    displayName: string;
    handle: string;
    bio: string | null;
    avatarUrl: string | null;
    coverUrl: string | null;
    categories: string[];
    subscriptionPriceMinor: number;
  } | null;
  application: any;
  content: { videos: any[]; lives: any[] };
  stats: { subscribers: number; videos: number; scheduledLives: number; earningsMinor: number };
} | null;

export function CreatorDashboardScreen({ token, creatorStatus, onEditProfile, onCompleteProfile, onBrowse, onSignOut }: Props) {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<Me>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/creator/me`, { headers: { Authorization: `Bearer ${token}` } });
        if (res.ok) setData(await res.json());
      } catch {} finally { setLoading(false); }
    })();
  }, [token]);

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.colors.bg, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color={theme.colors.primary} size="large" />
      </View>
    );
  }

  const p = data?.profile;
  const needsProfile = !p;
  const stats = data?.stats ?? { subscribers: 0, videos: 0, scheduledLives: 0, earningsMinor: 0 };

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.bg }}>
      {/* Cover */}
      <View style={{ height: 180, backgroundColor: theme.colors.primary }}>
        {p?.coverUrl ? (
          <Image source={{ uri: p.coverUrl }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
        ) : null}
        <View style={{ position: 'absolute', top: insets.top + 12, right: 16, flexDirection: 'row', gap: 8 }}>
          <Pressable onPress={onSignOut} style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center' }}>
            <Icon.Close size={18} color="#FFFFFF" />
          </Pressable>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40, gap: 16 }} showsVerticalScrollIndicator={false}>
        {/* Avatar + name */}
        <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 16, marginTop: -48 }}>
          <View style={{ width: 96, height: 96, borderRadius: 48, borderWidth: 4, borderColor: theme.colors.bg, backgroundColor: theme.colors.primary, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' }}>
            {p?.avatarUrl ? (
              <Image source={{ uri: p.avatarUrl }} style={{ width: '100%', height: '100%' }} />
            ) : (
              <Text style={{ color: theme.colors.onPrimary, fontSize: 32, fontWeight: '900' }}>
                {(p?.displayName ?? 'CR').slice(0, 2).toUpperCase()}
              </Text>
            )}
          </View>
          <View style={{ flex: 1, paddingBottom: 8 }}>
            <Text style={{ color: theme.colors.text, fontSize: 22, fontWeight: '900' }}>{p?.displayName ?? 'Creator'}</Text>
            <Text style={{ color: theme.colors.textMuted, fontSize: 13 }}>{p ? `@${p.handle}` : 'Complete your profile'}</Text>
          </View>
        </View>

        {/* Status pill */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <View style={{
            backgroundColor: creatorStatus === 'approved' ? theme.colors.primary : theme.mode === 'light' ? '#F0F2F5' : theme.colors.surface,
            paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999,
          }}>
            <Text style={{ color: creatorStatus === 'approved' ? theme.colors.onPrimary : theme.colors.text, fontSize: 12, fontWeight: '900' }}>
              {creatorStatus === 'approved' ? 'APPROVED' : creatorStatus === 'pending' ? 'PENDING' : creatorStatus === 'rejected' ? 'REJECTED' : 'NO PROFILE'}
            </Text>
          </View>
          {p?.categories && p.categories.length > 0 ? (
            <View style={{ flexDirection: 'row', gap: 4, flexWrap: 'wrap' }}>
              {p.categories.slice(0, 3).map((c) => (
                <View key={c} style={{ backgroundColor: theme.mode === 'light' ? '#F0F2F5' : theme.colors.surface, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999 }}>
                  <Text style={{ color: theme.colors.text, fontSize: 10, fontWeight: '700', textTransform: 'capitalize' }}>{c}</Text>
                </View>
              ))}
            </View>
          ) : null}
        </View>

        {/* Complete profile CTA */}
        {needsProfile ? (
          <View style={{ borderWidth: 2, borderColor: theme.colors.primary, borderRadius: theme.radii.lg, padding: 16, gap: 8 }}>
            <Text style={{ color: theme.colors.primary, fontSize: 12, fontWeight: '900', letterSpacing: 1 }}>GET STARTED</Text>
            <Text style={{ color: theme.colors.text, fontSize: 16, fontWeight: '800' }}>Complete your creator profile</Text>
            <Text style={{ color: theme.colors.textMuted, fontSize: 13 }}>Add a display name, handle, bio, categories, and subscription price to start uploading.</Text>
            <Pressable onPress={onCompleteProfile} style={{ backgroundColor: theme.colors.primary, paddingVertical: 12, borderRadius: 999, alignItems: 'center', marginTop: 8 }}>
              <Text style={{ color: theme.colors.onPrimary, fontWeight: '900', fontSize: 14 }}>Complete profile</Text>
            </Pressable>
          </View>
        ) : null}

        {/* Stats */}
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <StatBox label="Subscribers" value={stats.subscribers} theme={theme} />
          <StatBox label="Videos" value={stats.videos} theme={theme} />
          <StatBox label="Lives" value={stats.scheduledLives} theme={theme} />
        </View>

        {/* Earnings */}
        <View style={{ padding: 16, backgroundColor: theme.mode === 'light' ? '#F0F2F5' : theme.colors.surface, borderRadius: theme.radii.lg }}>
          <Text style={{ color: theme.colors.textMuted, fontSize: 11, fontWeight: '900', letterSpacing: 1 }}>EARNINGS</Text>
          <Text style={{ color: theme.colors.primary, fontSize: 26, fontWeight: '900', marginTop: 4 }}>
            KSh {(stats.earningsMinor / 100).toLocaleString()}
          </Text>
          <Text style={{ color: theme.colors.textMuted, fontSize: 12, marginTop: 2 }}>After 7-day hold</Text>
        </View>

        {/* Actions */}
        {p ? (
          <View style={{ gap: 10 }}>
            <ActionRow label="Edit profile" icon={<Icon.User size={18} color={theme.colors.primary} />} onPress={onEditProfile} theme={theme} />
            <ActionRow label="View my public profile" icon={<Icon.Explore size={18} color={theme.colors.primary} />} onPress={onBrowse} theme={theme} />
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
}

function StatBox({ label, value, theme }: { label: string; value: number; theme: any }) {
  return (
    <View style={{ flex: 1, padding: 14, backgroundColor: theme.mode === 'light' ? '#F0F2F5' : theme.colors.surface, borderRadius: theme.radii.md, alignItems: 'center' }}>
      <Text style={{ color: theme.colors.text, fontSize: 20, fontWeight: '900' }}>{value}</Text>
      <Text style={{ color: theme.colors.textMuted, fontSize: 11, marginTop: 2 }}>{label}</Text>
    </View>
  );
}

function ActionRow({ label, icon, onPress, theme }: { label: string; icon: React.ReactNode; onPress: () => void; theme: any }) {
  return (
    <Pressable onPress={onPress} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 14, backgroundColor: theme.colors.bg, borderRadius: theme.radii.md, borderWidth: 1, borderColor: theme.colors.border }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        {icon}
        <Text style={{ color: theme.colors.text, fontSize: 14, fontWeight: '700' }}>{label}</Text>
      </View>
      <Icon.Next size={16} color={theme.colors.text} />
    </Pressable>
  );
}
