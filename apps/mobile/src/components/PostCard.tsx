import React, { useState } from 'react';
import { View, Text, Pressable, ImageBackground, StyleSheet, type ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';
import { useTheme } from '../theme/ThemeProvider';
import { Avatar } from './Avatar';
import { Icon } from '../icons';

type Post = {
  id: string;
  title: string;
  creator: string;
  creatorAlias?: string;
  price?: string;
  priceMinor?: number;
  image: string;
  likesCount?: number;
  commentsCount?: number;
  isLocked?: boolean;
};

type Props = {
  post: Post;
  aspectRatio?: number;
  onUnlockPress?: () => void;
  onMessagePress?: () => void;
  style?: ViewStyle;
};

export function PostCard({ post, aspectRatio = 4 / 5, onUnlockPress, onMessagePress, style }: Props) {
  const { theme } = useTheme();
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(post.likesCount ?? 24);

  const toggleLike = () => {
    setLiked((prev) => !prev);
    setLikes((prev) => (liked ? prev - 1 : prev + 1));
  };

  const handle = post.creatorAlias ?? post.creator.toLowerCase().replace(/[^a-z0-9_]/g, '');
  const priceLabel = post.price ?? 'KSh 200/month';
  const locked = post.isLocked ?? false;

  return (
    <View
      style={[
        {
          backgroundColor: theme.colors.surface,
          borderRadius: theme.radii.lg,
          overflow: 'hidden',
        },
        style,
      ]}
    >
      {/* 1. Header */}
      <View style={{ padding: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 }}>
          <Avatar name={post.creator} size={40} />
          <View style={{ flex: 1 }}>
            <Text numberOfLines={1} style={{ color: theme.colors.text, fontSize: 15, fontWeight: '600', lineHeight: 20 }}>
              {post.creator}
            </Text>
            <Text numberOfLines={1} style={{ color: theme.colors.textMuted, fontSize: 13, lineHeight: 18 }}>
              @{handle} · {priceLabel}
            </Text>
          </View>
        </View>
        <Pressable accessibilityLabel="Options" style={{ padding: 4 }}>
          <Text style={{ color: theme.colors.textMuted, fontSize: 18, fontWeight: '700' }}>•••</Text>
        </Pressable>
      </View>

      {/* 2. Title line */}
      {post.title ? (
        <Text style={{ paddingHorizontal: 12, paddingBottom: 8, color: theme.colors.text, fontSize: 15, lineHeight: 21, fontWeight: '400' }}>
          {post.title}
        </Text>
      ) : null}

      {/* 3. Media */}
      <View style={{ width: '100%', aspectRatio, backgroundColor: theme.colors.surface, overflow: 'hidden' }}>
        <ImageBackground source={{ uri: post.image }} style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          {locked ? (
            <>
              <BlurView intensity={90} tint={theme.mode} style={StyleSheet.absoluteFill} />
              <View style={{ alignItems: 'center', gap: 8 }}>
                <View
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 24,
                    backgroundColor: theme.colors.scrim,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Icon.Lock size={24} color={theme.colors.onMedia} />
                </View>
                <Text style={{ color: theme.colors.onMedia, fontSize: 13, fontWeight: '600' }}>
                  Subscribe to unlock
                </Text>
              </View>
            </>
          ) : null}
        </ImageBackground>
      </View>

      {/* 4. Counts row */}
      <View style={{ paddingHorizontal: 12, paddingVertical: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <Icon.Heart size={14} color={theme.colors.primary} />
          <Text style={{ color: theme.colors.textMuted, fontSize: 13 }}>{likes}</Text>
        </View>
        <Text style={{ color: theme.colors.textMuted, fontSize: 13 }}>
          {post.commentsCount ?? 3} comments
        </Text>
      </View>

      {/* 5. Divider */}
      <View style={{ height: 1, backgroundColor: theme.colors.divider }} />

      {/* 6. Action row */}
      <View style={{ height: 44, flexDirection: 'row', alignItems: 'center' }}>
        <Pressable
          onPress={toggleLike}
          style={({ pressed }) => ({
            flex: 1,
            height: 44,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            backgroundColor: pressed ? theme.colors.surfaceAlt : 'transparent',
          })}
        >
          <Icon.Heart size={20} color={liked ? theme.colors.primary : theme.colors.icon} />
          <Text style={{ color: liked ? theme.colors.primary : theme.colors.textMuted, fontSize: 13, fontWeight: '600' }}>
            Like
          </Text>
        </Pressable>

        <Pressable
          onPress={onMessagePress}
          style={({ pressed }) => ({
            flex: 1,
            height: 44,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            backgroundColor: pressed ? theme.colors.surfaceAlt : 'transparent',
          })}
        >
          <Icon.Chat size={20} color={theme.colors.icon} />
          <Text style={{ color: theme.colors.textMuted, fontSize: 13, fontWeight: '600' }}>
            Message
          </Text>
        </Pressable>

        <Pressable
          onPress={onUnlockPress}
          style={({ pressed }) => ({
            flex: 1,
            height: 44,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            backgroundColor: pressed ? theme.colors.surfaceAlt : 'transparent',
          })}
        >
          {locked ? (
            <Icon.Lock size={20} color={theme.colors.primaryText} />
          ) : (
            <Icon.Unlock size={20} color={theme.colors.icon} />
          )}
          <Text style={{ color: locked ? theme.colors.primaryText : theme.colors.textMuted, fontSize: 13, fontWeight: '600' }}>
            {locked ? 'Unlock' : 'Unlocked'}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
