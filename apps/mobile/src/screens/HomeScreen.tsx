import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { TopBar } from '../components/TopBar';
import { BottomNav, NavRoute } from '../components/BottomNav';
import { Avatar, LiveRing } from '../components/Avatar';
import { PostCard } from '../components/PostCard';
import { Icon } from '../icons';
import { HOME_GRID_VIDEOS } from '../catalog';
import { listMySubscriptions } from '../api';

type LiveRoom = {
  id: string;
  title: string;
  creator: string;
  in: string;
  image: string;
  isLive?: boolean;
};

const LIVE_ROOMS: LiveRoom[] = [
  { id: 'l1', title: 'Friday vibes', creator: '@amara', in: 'LIVE NOW', image: 'https://images.pexels.com/photos/39569841/pexels-photo-39569841.jpeg?w=900', isLive: true },
  { id: 'l2', title: 'Q&A hour', creator: '@juma', in: 'in 5h', image: 'https://images.pexels.com/photos/29382377/pexels-photo-29382377.jpeg?w=900', isLive: false },
  { id: 'l3', title: 'Late talk', creator: '@nia', in: 'tomorrow', image: 'https://images.pexels.com/photos/10563851/pexels-photo-10563851.jpeg?w=900', isLive: false },
];

type Props = {
  token: string;
  onChat: () => void;
  onVideo: () => void;
  onNavigate: (route: NavRoute) => void;
};

export function HomeScreen({ token, onChat, onVideo, onNavigate }: Props) {
  const { theme } = useTheme();
  const [subs, setSubs] = useState<Set<string>>(new Set());

  useEffect(() => {
    listMySubscriptions(token)
      .then((list) =>
        setSubs(new Set(list.filter((s) => s.status === 'active').map((s) => s.creatorAlias))),
      )
      .catch(() => {});
  }, [token]);

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.bg }}>
      {/* 1. TopBar */}
      <TopBar
        onSearchPress={() => onNavigate('explore')}
        onNotifPress={() => {}}
      />

      <ScrollView contentContainerStyle={{ paddingBottom: 80 }} showsVerticalScrollIndicator={false}>
        {/* 2. Composer Card */}
        <View
          style={{
            marginHorizontal: 16,
            marginTop: 12,
            marginBottom: 16,
            backgroundColor: theme.colors.surface,
            borderRadius: theme.radii.lg,
            padding: 12,
            gap: 10,
          }}
        >
          <Pressable
            onPress={onChat}
            style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}
          >
            <Avatar name="Guest" size={40} />
            <View
              style={{
                flex: 1,
                height: 40,
                borderRadius: theme.radii.pill,
                backgroundColor: theme.colors.bg,
                justifyContent: 'center',
                paddingHorizontal: 16,
              }}
            >
              <Text style={{ color: theme.colors.textMuted, fontSize: 15 }}>
                Start a chat with a stranger…
              </Text>
            </View>
          </Pressable>

          <View style={{ height: 1, backgroundColor: theme.colors.divider }} />

          <View style={{ flexDirection: 'row', gap: 8 }}>
            <Pressable
              onPress={onChat}
              style={({ pressed }) => ({
                flex: 1,
                height: 44,
                borderRadius: theme.radii.pill,
                backgroundColor: pressed ? theme.colors.surfaceAlt : 'transparent',
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
              })}
            >
              <Icon.Chat size={20} color={theme.colors.primary} />
              <Text style={{ color: theme.colors.text, fontSize: 13, fontWeight: '600' }}>
                Text chat
              </Text>
            </Pressable>

            <Pressable
              onPress={onVideo}
              style={({ pressed }) => ({
                flex: 1,
                height: 44,
                borderRadius: theme.radii.pill,
                backgroundColor: pressed ? theme.colors.surfaceAlt : 'transparent',
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
              })}
            >
              <Icon.Video size={20} color={theme.colors.primary} />
              <Text style={{ color: theme.colors.text, fontSize: 13, fontWeight: '600' }}>
                Video chat
              </Text>
            </Pressable>
          </View>

          <Text style={{ color: theme.colors.textMuted, fontSize: 12, textAlign: 'center' }}>
            Text only. Aliases. Report anytime.
          </Text>
        </View>

        {/* 3. Live Strip */}
        <View style={{ marginBottom: 16 }}>
          <View style={{ paddingHorizontal: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <Text style={{ color: theme.colors.text, fontSize: 17, fontWeight: '700' }}>Live rooms</Text>
            <Pressable onPress={() => onNavigate('explore')}>
              <Text style={{ color: theme.colors.primaryText, fontSize: 13, fontWeight: '600' }}>See all</Text>
            </Pressable>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 16 }}>
            {LIVE_ROOMS.map((room) => {
              const isSubbed = subs.has(room.creator);
              return (
                <Pressable key={room.id} style={{ width: 72, alignItems: 'center', gap: 4 }}>
                  <LiveRing
                    uri={room.image}
                    name={room.creator}
                    size={56}
                    isLive={room.isLive}
                    isScheduled={!room.isLive}
                  />
                  {isSubbed ? (
                    <View style={{ position: 'absolute', top: 0, right: 4, width: 16, height: 16, borderRadius: 8, backgroundColor: theme.colors.primary, alignItems: 'center', justifyContent: 'center' }}>
                      <Icon.Heart size={10} color="#FFFFFF" />
                    </View>
                  ) : null}
                  <Text numberOfLines={1} style={{ color: theme.colors.text, fontSize: 12, fontWeight: '500', textAlign: 'center' }}>
                    {room.creator}
                  </Text>
                  <Text numberOfLines={1} style={{ color: theme.colors.textMuted, fontSize: 11, textAlign: 'center' }}>
                    {room.in}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        {/* 4. Feed PostCards */}
        <View style={{ paddingHorizontal: 16, gap: 8 }}>
          {HOME_GRID_VIDEOS.map((video) => {
            const isLocked = !subs.has(video.creator);
            return (
              <PostCard
                key={video.id}
                post={{
                  id: video.id,
                  title: video.title,
                  creator: video.creator,
                  creatorAlias: video.creator.replace('@', ''),
                  price: video.price,
                  priceMinor: video.priceMinor,
                  image: video.image,
                  isLocked,
                }}
                onUnlockPress={() => onNavigate('explore')}
                onMessagePress={onChat}
              />
            );
          })}
        </View>

        {/* 5. Footer */}
        <Text style={{ padding: 24, textAlign: 'center', color: theme.colors.textMuted, fontSize: 13 }}>
          You're all caught up
        </Text>
      </ScrollView>

      <BottomNav active="home" onNavigate={onNavigate} />
    </View>
  );
}
