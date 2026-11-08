import React, { useState } from 'react';
import { View, Text, Pressable, Image, TextInput, ActivityIndicator, Share } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { Icon } from '../icons';
import { API_BASE } from '../api';

export type FeedPost = {
  id: string;
  caption: string;
  mediaType: string;
  mediaUrl: string;
  createdAt: string;
  creator: { id: string; handle: string; displayName: string; avatarUrl: string | null; subscriptionPriceMinor: number } | null;
  comments: { id: string; parentId: string | null; text: string; authorAlias: string; createdAt: string; likeCount: number; likedByMe: boolean }[];
  likeCount: number;
  likedByMe: boolean;
};

export function timeAgo(iso: string) {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  return `${Math.floor(diff / 86400)}d`;
}

export function PostCard({ post, token, subscribed, shadowStyle, onSubscribe }: {
  post: FeedPost;
  token: string;
  subscribed: boolean;
  shadowStyle: any;
  onSubscribe: (c: { id: string; handle: string; subscriptionPriceMinor: number }) => void;
}) {
  const { theme } = useTheme();
  const [comments, setComments] = useState(post.comments);
  const [likes, setLikes] = useState({ count: post.likeCount ?? 0, liked: post.likedByMe ?? false });
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const [showComments, setShowComments] = useState(false);

  const toggleLike = async () => {
    const nextLiked = !likes.liked;
    setLikes({ count: likes.count + (nextLiked ? 1 : -1), liked: nextLiked });
    try {
      await fetch(`${API_BASE}/catalog/posts/${post.id}/like`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch {
      setLikes({ count: likes.count, liked: likes.liked });
    }
  };

  const addComment = async () => {
    const text = draft.trim();
    if (!text || sending) return;
    setSending(true);
    try {
      const res = await fetch(`${API_BASE}/catalog/posts/${post.id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ text }),
      });
      if (res.ok) {
        const cm = await res.json();
        setComments((prev) => [...prev, cm]);
        setDraft('');
      }
    } catch {} finally { setSending(false); }
  };

  return (
    <View style={[
      { backgroundColor: theme.mode === 'light' ? '#FFFFFF' : theme.colors.surface, borderRadius: 16, overflow: 'hidden' },
      shadowStyle,
    ]}>
      {/* Header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14 }}>
        <View style={{ width: 44, height: 44, borderRadius: 22, overflow: 'hidden', backgroundColor: theme.colors.primary, alignItems: 'center', justifyContent: 'center' }}>
          {post.creator?.avatarUrl ? (
            <Image source={{ uri: post.creator.avatarUrl }} style={{ width: '100%', height: '100%' }} />
          ) : (
            <Text style={{ color: theme.colors.onPrimary, fontSize: 15, fontWeight: '900' }}>
              {(post.creator?.displayName ?? 'C').slice(0, 2).toUpperCase()}
            </Text>
          )}
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ color: theme.colors.text, fontSize: 14, fontWeight: '900' }}>{post.creator?.displayName ?? 'Creator'}</Text>
          <Text style={{ color: theme.colors.textMuted, fontSize: 12 }}>@{post.creator?.handle} · {timeAgo(post.createdAt)}</Text>
        </View>
        <View style={{ backgroundColor: subscribed ? theme.colors.primary : (theme.mode === 'light' ? '#F0F2F5' : theme.colors.bg), paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999 }}>
          <Text style={{ color: subscribed ? theme.colors.onPrimary : theme.colors.primary, fontSize: 11, fontWeight: '900' }}>
            {subscribed ? 'Subscribed' : `KSh ${((post.creator?.subscriptionPriceMinor ?? 0) / 100).toFixed(0)}/mo`}
          </Text>
        </View>
      </View>

      <Text style={{ color: theme.colors.text, fontSize: 14, paddingHorizontal: 14, paddingBottom: 12 }}>{post.caption}</Text>

      {/* Media */}
      <View style={{ aspectRatio: 1, backgroundColor: '#000' }}>
        <Image source={{ uri: post.mediaUrl }} style={{ width: '100%', height: '100%' }} resizeMode="cover" blurRadius={subscribed ? 0 : 40} />
        {!subscribed ? (
          <Pressable
            onPress={() => post.creator && onSubscribe({ id: post.creator.id, handle: post.creator.handle, subscriptionPriceMinor: post.creator.subscriptionPriceMinor })}
            style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.45)' }}
          >
            <Icon.Lock size={32} color="#FFFFFF" />
            <Text style={{ color: '#FFFFFF', fontSize: 13, fontWeight: '800', marginTop: 8 }}>Subscribe to unlock</Text>
            <View style={{ backgroundColor: theme.colors.primary, paddingHorizontal: 14, paddingVertical: 6, borderRadius: 999, marginTop: 10 }}>
              <Text style={{ color: theme.colors.onPrimary, fontWeight: '900', fontSize: 12 }}>
                KSh {((post.creator?.subscriptionPriceMinor ?? 0) / 100).toFixed(0)}/mo
              </Text>
            </View>
          </Pressable>
        ) : null}
      </View>

      {/* Actions */}
      <View style={{ flexDirection: 'row' }}>
        <Pressable onPress={toggleLike} style={{ flex: 1, paddingVertical: 12, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 6 }}>
          <Icon.Heart size={16} color={likes.liked ? theme.colors.primary : theme.colors.text} />
          <Text style={{ color: likes.liked ? theme.colors.primary : theme.colors.text, fontSize: 13, fontWeight: '700' }}>
            {likes.count > 0 ? `${likes.count} ` : ''}Like
          </Text>
        </Pressable>
        <Pressable onPress={() => setShowComments((v) => !v)} style={{ flex: 1, paddingVertical: 12, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 6 }}>
          <Icon.Chat size={16} color={theme.colors.text} />
          <Text style={{ color: theme.colors.text, fontSize: 13, fontWeight: '700' }}>Comment ({comments.length})</Text>
        </Pressable>
        <Pressable
          onPress={async () => {
            if (!subscribed && post.creator) {
              onSubscribe({ id: post.creator.id, handle: post.creator.handle, subscriptionPriceMinor: post.creator.subscriptionPriceMinor });
              return;
            }
            try {
              await Share.share({
                message: `${post.creator?.displayName ?? 'A creator'} on POSHA: "${post.caption}"`,
                url: post.mediaUrl,
              });
            } catch {}
          }}
          style={{ flex: 1, paddingVertical: 12, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 6 }}
        >
          <Icon.Next size={16} color={theme.colors.text} />
          <Text style={{ color: theme.colors.text, fontSize: 13, fontWeight: '700' }}>
            {subscribed ? 'Share' : 'Unlock'}
          </Text>
        </Pressable>
      </View>

      {/* Comments */}
      {showComments ? (
        <View style={{ padding: 12, gap: 10 }}>
          {comments.length === 0 ? (
            <Text style={{ color: theme.colors.textMuted, fontSize: 13, textAlign: 'center', paddingVertical: 8 }}>No comments yet.</Text>
          ) : comments.filter((c) => !c.parentId).map((c) => (
            <View key={c.id} style={{ flexDirection: 'row', gap: 8, marginBottom: 8 }}>
              <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: theme.colors.primary, alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Text style={{ color: theme.colors.onPrimary, fontSize: 11, fontWeight: '900' }}>{c.authorAlias.slice(-2)}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <View style={{ backgroundColor: theme.mode === 'light' ? '#F0F2F5' : theme.colors.surface, borderRadius: 18, paddingHorizontal: 12, paddingVertical: 8 }}>
                  <Text style={{ color: theme.colors.text, fontSize: 13, fontWeight: '600' }}>{c.authorAlias}</Text>
                  <Text style={{ color: theme.colors.text, fontSize: 15, lineHeight: 20, marginTop: 2 }}>{c.text}</Text>
                </View>
                <View style={{ flexDirection: 'row', gap: 12, marginLeft: 12, marginTop: 4 }}>
                  <Text style={{ color: theme.colors.textMuted, fontSize: 12, fontWeight: '600' }}>Like</Text>
                  <Text style={{ color: theme.colors.textMuted, fontSize: 12, fontWeight: '600' }}>Reply</Text>
                  <Text style={{ color: theme.colors.textMuted, fontSize: 12 }}>{timeAgo(c.createdAt)}</Text>
                </View>
              </View>
            </View>
          ))}
          <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
            <TextInput
              value={draft}
              onChangeText={setDraft}
              placeholder="Write a comment..."
              placeholderTextColor={theme.colors.textMuted}
              maxLength={500}
              style={{ flex: 1, borderWidth: 1, borderColor: theme.colors.border, borderRadius: 999, paddingHorizontal: 14, paddingVertical: 8, color: theme.colors.text, fontSize: 13 }}
            />
            <Pressable onPress={addComment} disabled={!draft.trim() || sending} style={{ backgroundColor: theme.colors.primary, width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', opacity: draft.trim() && !sending ? 1 : 0.4 }}>
              {sending ? <ActivityIndicator color={theme.colors.onPrimary} size="small" /> : <Icon.Next size={14} color={theme.colors.onPrimary} />}
            </Pressable>
          </View>
        </View>
      ) : null}
    </View>
  );
}
