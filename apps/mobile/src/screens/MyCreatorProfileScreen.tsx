import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, ActivityIndicator } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { Icon } from '../icons';
import { CreatorProfileScreen } from './CreatorProfileScreen';
import { API_BASE } from '../api';

type Props = {
  token: string;
  onDashboard: () => void;
  onCreate: () => void;
  onEditProfile: () => void;
  onCompleteProfile: () => void;
};

export function MyCreatorProfileScreen({ token, onDashboard, onCreate, onEditProfile, onCompleteProfile }: Props) {
  const { theme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [handle, setHandle] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/creator/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          const p = data?.profile ?? data?.application;
          if (p?.handle) {
            setHandle(p.handle);
            setUserId(data?.profile?.userId ?? null);
          }
        }
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

  if (!handle) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.colors.bg, alignItems: 'center', justifyContent: 'center', padding: 24, gap: 16 }}>
        <Icon.User size={48} color={theme.colors.primary} />
        <Text style={{ color: theme.colors.text, fontSize: 20, fontWeight: '900', textAlign: 'center' }}>
          Complete your creator profile
        </Text>
        <Text style={{ color: theme.colors.textMuted, fontSize: 14, textAlign: 'center' }}>
          Add your display name, handle, bio, and categories to get started.
        </Text>
        <Pressable onPress={onCompleteProfile} style={{ marginTop: 8, paddingHorizontal: 32, paddingVertical: 14, backgroundColor: theme.colors.primary, borderRadius: 999 }}>
          <Text style={{ color: theme.colors.onPrimary, fontWeight: '900', fontSize: 15 }}>Complete profile</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <CreatorProfileScreen
      token={token}
      handle={handle}
      viewerRole="creator"
      viewerUserId={userId ?? undefined}
      onBack={() => {}}
      onDashboard={onDashboard}
      onCreate={onCreate}
      onEditProfile={onEditProfile}
    />
  );
}
