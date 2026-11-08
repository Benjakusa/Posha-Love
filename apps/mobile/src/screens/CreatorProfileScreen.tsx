import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, Pressable, Image, ActivityIndicator, Modal } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeProvider';
import { Icon } from '../icons';
import { SubscribeSheet } from '../components/SubscribeSheet';
import { PostCard } from '../components/PostCard';
import { API_BASE } from '../api';

type Profile = {
  userId: string;
  handle: string;
  displayName: string;
  bio: string | null;
  gender: string | null;
  ethnicity: string | null;
  orientation: string | null;
  categories: string[];
  languages: string[];
  country: string | null;
  ageMin: number | null;
  ageMax: number | null;
  avatarUrl: string | null;
  coverUrl: string | null;
  subscriptionPriceMinor: number;
};

type Post = {
  id: string;
  caption: string;
  mediaType: string;
  mediaUrl: string | null;
  lockedMediaKey: string | null;
  createdAt: string;
  likeCount: number;
};

type Props = {
  token: string;
  handle: string;
  viewerRole?: string;
  viewerUserId?: string;
  onBack: () => void;
  onDashboard?: () => void;
  onCreate?: () => void;
  onEditProfile?: () => void;
};

const cardShadow = (theme: any) => ({
  shadowColor: theme.mode === 'light' ? '#000000' : '#FFFFFF',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: theme.mode === 'light' ? 0.06 : 0.10,
  shadowRadius: 8,
  elevation: theme.mode === 'light' ? 2 : 0,
});

export function CreatorProfileScreen({ token, handle, viewerRole, viewerUserId, onBack, onDashboard, onCreate, onEditProfile }: Props) {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [subscribed, setSubscribed] = useState(false);
  const [subscriberCount, setSubscriberCount] = useState(0);
  const [payTarget, setPayTarget] = useState<{ creatorId: string; alias: string; priceMinor: number } | null>(null);
  const [contentTab, setContentTab] = useState<'videos' | 'images'>('videos');
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);

  const isOwnProfile = viewerUserId && profile && viewerUserId === profile.userId;

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_BASE}/catalog/creator/${handle}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error('not found');
        const data = await res.json();
        setProfile(data.profile);
        setPosts(data.posts ?? []);
        setSubscribed(data.subscribed ?? false);

        // Fetch subscriber count in background
        fetch(`${API_BASE}/catalog/creators?q=${handle}`, { headers: { Authorization: `Bearer ${token}` } })
          .then((r) => r.json())
          .then((list) => {
            const match = Array.isArray(list) ? list.find((c: any) => c.handle === handle) : null;
            if (match?.subscriberCount) setSubscriberCount(match.subscriberCount);
          })
          .catch(() => {});
      } catch {} finally { setLoading(false); }
    })();
  }, [token, handle]);

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.colors.bg, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color={theme.colors.primary} size="large" />
      </View>
    );
  }

  if (!profile) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.colors.bg, alignItems: 'center', justifyContent: 'center', gap: 12, padding: 24 }}>
        <Text style={{ color: theme.colors.text, fontSize: 16 }}>Creator not found.</Text>
        <Pressable onPress={onBack}><Text style={{ color: theme.colors.primary, fontWeight: '800' }}>Go back</Text></Pressable>
      </View>
    );
  }

  const videos = posts.filter((p) => p.mediaType === 'video');
  const images = posts.filter((p) => p.mediaType === 'image');

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.bg }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
        {/* COVER */}
        <View style={{ height: 200, backgroundColor: theme.colors.primary, position: 'relative' }}>
          {profile.coverUrl ? (
            <Image source={{ uri: profile.coverUrl }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
          ) : null}
          <Pressable onPress={onBack} style={{ position: 'absolute', top: insets.top + 12, left: 16, width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center' }}>
            <Icon.Back size={22} color="#FFFFFF" />
          </Pressable>
        </View>

        {/* PROFILE PICTURE — centered */}
        <View style={{ marginTop: -56, alignItems: 'center' }}>
          <View style={{ width: 112, height: 112, borderRadius: 56, borderWidth: 4, borderColor: theme.colors.bg, backgroundColor: theme.colors.primary, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' }}>
              {profile.avatarUrl ? (
                <Image source={{ uri: profile.avatarUrl }} style={{ width: '100%', height: '100%' }} />
              ) : (
                <Text style={{ color: theme.colors.onPrimary, fontSize: 36, fontWeight: '900' }}>
                  {profile.displayName.slice(0, 2).toUpperCase()}
                </Text>
              )}
          </View>
        </View>

        <View style={{ paddingHorizontal: 20, paddingTop: 12, alignItems: 'center' }}>
          {/* Username */}
          <Text style={{ color: theme.colors.text, fontSize: 26, fontWeight: '900', textAlign: 'center' }}>{profile.displayName}</Text>
          <Text style={{ color: theme.colors.textMuted, fontSize: 15, marginTop: 2, textAlign: 'center' }}>@{profile.handle}</Text>

          {/* Subscribers + Edit icon */}
          <View style={{ alignItems: 'center', marginTop: 8, gap: 10 }}>
            <Text style={{ color: theme.colors.text, fontSize: 14, fontWeight: '700', textAlign: 'center' }}>
              {subscriberCount > 0 ? `${subscriberCount.toLocaleString()} subscriber${subscriberCount !== 1 ? 's' : ''}` : 'No subscribers yet'}
            </Text>
            {isOwnProfile && onEditProfile ? (
              <Pressable onPress={onEditProfile} style={[{ width: 36, height: 36, borderRadius: 18, backgroundColor: theme.mode === 'light' ? '#FFFFFF' : theme.colors.surface, alignItems: 'center', justifyContent: 'center' }, cardShadow(theme)]}>
                <Icon.Settings size={18} color={theme.colors.primary} />
              </Pressable>
            ) : null}
          </View>

          {/* Bio */}
          {profile.bio ? (
            <Text style={{ color: theme.colors.text, fontSize: 14, lineHeight: 20, marginTop: 12, textAlign: 'center' }}>{profile.bio}</Text>
          ) : null}

          {/* Two buttons: Dashboard + Create (own) OR Subscribe (public) */}
          {isOwnProfile ? (
            <View style={{ flexDirection: 'row', gap: 10, marginTop: 16 }}>
              <Pressable onPress={onDashboard} style={[{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 12, borderRadius: 999, backgroundColor: theme.mode === 'light' ? '#FFFFFF' : theme.colors.surface }, cardShadow(theme)]}>
                <Icon.Next size={16} color={theme.colors.primary} />
                <Text style={{ color: theme.colors.primary, fontSize: 14, fontWeight: '900' }}>Dashboard</Text>
              </Pressable>
              <Pressable onPress={onCreate} style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 12, borderRadius: 999, backgroundColor: theme.colors.primary }}>
                <Icon.Chat size={16} color={theme.colors.onPrimary} />
                <Text style={{ color: theme.colors.onPrimary, fontSize: 14, fontWeight: '900' }}>Create</Text>
              </Pressable>
            </View>
          ) : (
            <Pressable
              onPress={() => subscribed ? null : setPayTarget({ creatorId: profile.userId, alias: profile.handle, priceMinor: profile.subscriptionPriceMinor })}
              disabled={subscribed}
              style={{
                marginTop: 16,
                paddingVertical: 14,
                paddingHorizontal: 20,
                borderRadius: 999,
                backgroundColor: subscribed ? (theme.mode === 'light' ? '#F0F2F5' : theme.colors.surface) : theme.colors.primary,
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <Icon.Lock size={16} color={subscribed ? theme.colors.text : theme.colors.onPrimary} />
              <Text
                numberOfLines={1}
                style={{ color: subscribed ? theme.colors.text : theme.colors.onPrimary, fontSize: 15, fontWeight: '900', flexShrink: 1 }}
              >
                {subscribed ? 'Subscribed ✓' : `Subscribe · KSh ${(profile.subscriptionPriceMinor / 100).toFixed(0)}/mo`}
              </Text>
            </Pressable>
          )}

          {/* Personal info card */}
          <View style={[{ marginTop: 20, backgroundColor: theme.mode === 'light' ? '#FFFFFF' : theme.colors.surface, borderRadius: 16, padding: 16, gap: 12 }, cardShadow(theme)]}>
            <Text style={{ color: theme.colors.text, fontSize: 15, fontWeight: '900' }}>About</Text>

            {profile.categories.length > 0 ? (
              <View style={{ gap: 6 }}>
                <Text style={{ color: theme.colors.textMuted, fontSize: 11, fontWeight: '900', letterSpacing: 1 }}>CATEGORIES</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
                  {profile.categories.map((c) => (
                    <View key={c} style={{ backgroundColor: theme.mode === 'light' ? '#F5F6F8' : theme.colors.bg, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 }}>
                      <Text style={{ color: theme.colors.text, fontSize: 12, fontWeight: '700', textTransform: 'capitalize' }}>{c}</Text>
                    </View>
                  ))}
                </View>
              </View>
            ) : null}

            {profile.languages.length > 0 ? (
              <View style={{ gap: 6 }}>
                <Text style={{ color: theme.colors.textMuted, fontSize: 11, fontWeight: '900', letterSpacing: 1 }}>LANGUAGES</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
                  {profile.languages.map((l) => (
                    <View key={l} style={{ backgroundColor: theme.mode === 'light' ? '#F5F6F8' : theme.colors.bg, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 }}>
                      <Text style={{ color: theme.colors.text, fontSize: 12, fontWeight: '700', textTransform: 'capitalize' }}>{l}</Text>
                    </View>
                  ))}
                </View>
              </View>
            ) : null}

            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 16 }}>
              {profile.gender ? <InfoRow label="Gender" value={profile.gender} theme={theme} /> : null}
              {profile.ethnicity ? <InfoRow label="Ethnicity" value={profile.ethnicity} theme={theme} /> : null}
              {profile.orientation ? <InfoRow label="Orientation" value={profile.orientation} theme={theme} /> : null}
              {profile.ageMin && profile.ageMax ? <InfoRow label="Age" value={`${profile.ageMin}–${profile.ageMax}`} theme={theme} /> : null}
              {profile.country ? <InfoRow label="Country" value={profile.country} theme={theme} /> : null}
            </View>

            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 8, borderTopWidth: 1, borderTopColor: theme.mode === 'light' ? '#F0F2F5' : theme.colors.border }}>
              <Text style={{ color: theme.colors.textMuted, fontSize: 12, fontWeight: '700' }}>Subscription</Text>
              <Text style={{ color: theme.colors.primary, fontSize: 16, fontWeight: '900' }}>
                KSh {(profile.subscriptionPriceMinor / 100).toFixed(0)} / month
              </Text>
            </View>
          </View>



          {/* Content tabs: Videos | Images */}
          <View style={{ marginTop: 20 }}>
            <View style={{ flexDirection: 'row', gap: 8, marginBottom: 12 }}>
              {(['videos', 'images'] as const).map((tab) => {
                const active = contentTab === tab;
                const count = tab === 'videos' ? videos.length : images.length;
                return (
                  <Pressable
                    key={tab}
                    onPress={() => setContentTab(tab)}
                    style={[
                      {
                        flex: 1,
                        paddingVertical: 10,
                        borderRadius: 999,
                        alignItems: 'center',
                        backgroundColor: active ? theme.colors.primary : (theme.mode === 'light' ? '#FFFFFF' : theme.colors.surface),
                      },
                      active ? {} : cardShadow(theme),
                    ]}
                  >
                    <Text style={{ color: active ? theme.colors.onPrimary : theme.colors.text, fontWeight: '900', fontSize: 14, textTransform: 'capitalize' }}>
                      {tab} ({count})
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            {/* Grid */}
            {contentTab === 'videos' ? (
              videos.length === 0 ? (
                <Text style={{ color: theme.colors.textMuted, textAlign: 'center', padding: 24 }}>No videos yet.</Text>
              ) : (
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 4 }}>
                  {videos.map((v) => (
                    <Pressable
                      key={v.id}
                      onPress={() => setSelectedPost(v)}
                      style={{ width: '32%', aspectRatio: 1, borderRadius: 8, overflow: 'hidden', backgroundColor: '#000' }}
                    >
                      {subscribed && v.mediaUrl ? (
                        <Image source={{ uri: v.mediaUrl }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
                      ) : (
                        <View style={{ flex: 1, backgroundColor: theme.mode === 'light' ? '#F0F2F5' : theme.colors.surface, alignItems: 'center', justifyContent: 'center' }}>
                          <Icon.Lock size={20} color={theme.colors.textMuted} />
                        </View>
                      )}
                    </Pressable>
                  ))}
                </View>
              )
            ) : (
              images.length === 0 ? (
                <Text style={{ color: theme.colors.textMuted, textAlign: 'center', padding: 24 }}>No photos yet.</Text>
              ) : (
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 4 }}>
                  {images.map((p) => (
                    <Pressable
                      key={p.id}
                      onPress={() => setSelectedPost(p)}
                      style={{ width: '32%', aspectRatio: 1, borderRadius: 8, overflow: 'hidden', backgroundColor: '#000' }}
                    >
                      {subscribed && p.mediaUrl ? (
                        <Image source={{ uri: p.mediaUrl }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
                      ) : (
                        <View style={{ flex: 1, backgroundColor: theme.mode === 'light' ? '#F0F2F5' : theme.colors.surface, alignItems: 'center', justifyContent: 'center' }}>
                          <Icon.Lock size={20} color={theme.colors.textMuted} />
                        </View>
                      )}
                    </Pressable>
                  ))}
                </View>
              )
            )}
          </View>
        </View>
      </ScrollView>


      {/* Post preview modal */}
      {selectedPost && profile ? (
        <Modal visible={true} animationType="slide" transparent={false} onRequestClose={() => setSelectedPost(null)}>
          <View style={{ flex: 1, backgroundColor: theme.colors.bg }}>
            <View style={{ paddingTop: insets.top + 12, paddingBottom: 12, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <Pressable onPress={() => setSelectedPost(null)}><Icon.Back size={24} color={theme.colors.text} /></Pressable>
              <Text style={{ color: theme.colors.text, fontSize: 18, fontWeight: '900' }}>Post</Text>
            </View>
            <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
              <PostCard
                post={{
                  id: selectedPost.id,
                  caption: selectedPost.caption,
                  mediaType: selectedPost.mediaType,
                  mediaUrl: selectedPost.mediaUrl ?? '',
                  createdAt: selectedPost.createdAt,
                  creator: {
                    id: profile.userId,
                    handle: profile.handle,
                    displayName: profile.displayName,
                    avatarUrl: profile.avatarUrl,
                    subscriptionPriceMinor: profile.subscriptionPriceMinor,
                  },
                  comments: [],
                  likeCount: selectedPost.likeCount,
                  likedByMe: false,
                }}
                token={token}
                subscribed={subscribed}
                shadowStyle={cardShadow(theme)}
                onSubscribe={() => {
                  setSelectedPost(null);
                  setPayTarget({ creatorId: profile.userId, alias: profile.handle, priceMinor: profile.subscriptionPriceMinor });
                }}
              />
            </ScrollView>
          </View>
        </Modal>
      ) : null}

      {payTarget ? (
        <SubscribeSheet
          visible={true}
          token={token}
          creatorId={payTarget.creatorId}
          creatorAlias={payTarget.alias}
          priceMinor={payTarget.priceMinor}
          onClose={() => setPayTarget(null)}
          onSubscribed={() => {
            setSubscribed(true);
            setPayTarget(null);
            (async () => {
              const res = await fetch(`${API_BASE}/catalog/creator/${handle}`, { headers: { Authorization: `Bearer ${token}` } });
              if (res.ok) {
                const d = await res.json();
                setPosts(d.posts ?? []);
                setSubscribed(d.subscribed ?? false);
              }
            })();
          }}
        />
      ) : null}
    </View>
  );
}

function InfoRow({ label, value, theme }: { label: string; value: string; theme: any }) {
  return (
    <View style={{ gap: 2 }}>
      <Text style={{ color: theme.colors.textMuted, fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 }}>{label}</Text>
      <Text style={{ color: theme.colors.text, fontSize: 14, fontWeight: '700', textTransform: 'capitalize' }}>{value}</Text>
    </View>
  );
}
