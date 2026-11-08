import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, TextInput, Image, ActivityIndicator, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { useTheme } from '../theme/ThemeProvider';
import { Icon } from '../icons';
import { API_BASE } from '../api';

type Props = { token: string; onBack: () => void; onCreated: () => void };

export function CreatePostScreen({ token, onBack, onCreated }: Props) {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const [mediaUri, setMediaUri] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<'image' | 'video'>('image');
  const [base64Data, setBase64Data] = useState<string | null>(null);
  const [caption, setCaption] = useState('');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pick = async (kind: 'image' | 'video') => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) { setError('Permission denied'); return; }
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: kind === 'video' ? ['videos'] : ['images'],
      allowsEditing: false,
      quality: 0.8,
      base64: kind === 'image',
    });
    if (res.canceled || !res.assets[0]) return;
    setMediaUri(res.assets[0].uri);
    setMediaType(kind);
    setBase64Data(res.assets[0].base64 ?? null);
  };

  const submit = async () => {
    if (!caption.trim()) { setError('Add a caption'); return; }
    if (!mediaUri) { setError('Pick an image or video'); return; }
    setUploading(true); setError(null);
    try {
      let mediaKey = '';
      if (mediaType === 'image' && base64Data) {
        const presignRes = await fetch(`${API_BASE}/creator/presign-image`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ kind: 'avatar', contentType: 'image/jpeg' }),
        });
        if (!presignRes.ok) throw new Error('Presign failed');
        const { uploadUrl, key } = await presignRes.json();
        if (!uploadUrl) throw new Error('R2 not configured');
        const byteChars = atob(base64Data);
        const bytes = new Uint8Array(byteChars.length);
        for (let i = 0; i < byteChars.length; i++) bytes[i] = byteChars.charCodeAt(i);
        const blob = new Blob([bytes], { type: 'image/jpeg' });
        const put = await fetch(uploadUrl, { method: 'PUT', headers: { 'Content-Type': 'image/jpeg' }, body: blob });
        if (!put.ok) throw new Error('Upload failed');
        mediaKey = key;
      } else {
        // Video upload not yet implemented — placeholder
        mediaKey = mediaUri;
      }

      const res = await fetch(`${API_BASE}/creator/posts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ caption: caption.trim(), mediaKey, mediaType }),
      });
      if (!res.ok) throw new Error('Post failed');
      Alert.alert('Posted', 'Your content is live.');
      onCreated();
    } catch (e: any) {
      setError(e?.message ?? 'Failed');
    } finally { setUploading(false); }
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.bg }}>
      <View style={{ paddingTop: insets.top + 12, paddingBottom: 12, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <Pressable onPress={onBack}><Icon.Back size={24} color={theme.colors.text} /></Pressable>
        <Text style={{ color: theme.colors.text, fontSize: 18, fontWeight: '900', flex: 1 }}>Create</Text>
        <Pressable onPress={submit} disabled={uploading || !caption.trim() || !mediaUri}>
          {uploading ? <ActivityIndicator color={theme.colors.primary} /> : (
            <Text style={{ color: caption.trim() && mediaUri ? theme.colors.primary : theme.colors.textMuted, fontWeight: '900', fontSize: 15 }}>Post</Text>
          )}
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, gap: 16 }}>
        {mediaUri ? (
          <Image source={{ uri: mediaUri }} style={{ width: '100%', aspectRatio: mediaType === 'video' ? 16 / 9 : 1, borderRadius: 16, backgroundColor: '#000' }} resizeMode="cover" />
        ) : (
          <View style={{ width: '100%', aspectRatio: 1, borderRadius: 16, backgroundColor: theme.mode === 'light' ? '#F5F6F8' : theme.colors.surface, alignItems: 'center', justifyContent: 'center', gap: 12 }}>
            <Icon.Video size={40} color={theme.colors.primary} />
            <Text style={{ color: theme.colors.textMuted, fontSize: 14 }}>Choose media to upload</Text>
          </View>
        )}

        <View style={{ flexDirection: 'row', gap: 10 }}>
          <Pressable onPress={() => pick('image')} style={{ flex: 1, paddingVertical: 12, borderRadius: 999, alignItems: 'center', backgroundColor: theme.mode === 'light' ? '#F5F6F8' : theme.colors.surface }}>
            <Text style={{ color: theme.colors.text, fontWeight: '800' }}>Pick image</Text>
          </Pressable>
          <Pressable onPress={() => pick('video')} style={{ flex: 1, paddingVertical: 12, borderRadius: 999, alignItems: 'center', backgroundColor: theme.mode === 'light' ? '#F5F6F8' : theme.colors.surface }}>
            <Text style={{ color: theme.colors.text, fontWeight: '800' }}>Pick video</Text>
          </Pressable>
        </View>

        <TextInput
          value={caption}
          onChangeText={setCaption}
          placeholder="Write a caption..."
          placeholderTextColor={theme.colors.textMuted}
          multiline
          maxLength={300}
          style={{ minHeight: 100, textAlignVertical: 'top', color: theme.colors.text, backgroundColor: theme.mode === 'light' ? '#F5F6F8' : theme.colors.surface, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15 }}
        />

        {error ? <Text style={{ color: theme.colors.danger, fontSize: 13 }}>{error}</Text> : null}
      </ScrollView>
    </View>
  );
}
