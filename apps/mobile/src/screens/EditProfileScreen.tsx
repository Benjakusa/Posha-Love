import React, { useEffect, useState } from 'react';
import {
  View, Text, TextInput, Pressable, ScrollView, Image, ActivityIndicator,
  KeyboardAvoidingView, Platform, Switch, Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { useTheme } from '../theme/ThemeProvider';
import { Icon } from '../icons';
import { API_BASE } from '../api';

type Props = {
  token: string;
  onSaved: () => void;
  onCancel: () => void;
};

type Profile = {
  displayName: string;
  handle: string;
  bio: string | null;
  avatarKey: string | null;
  coverKey: string | null;
  avatarUrl: string | null;
  coverUrl: string | null;
  category: string | null;
  instagram: string | null;
  tiktok: string | null;
  youtube: string | null;
  xHandle: string | null;
  publicProfile: boolean;
  showVideos: boolean;
  showLives: boolean;
  subscriptionPriceMinor: number;
};

const CATEGORIES = ['male', 'female', 'trans', 'petite', 'black', 'other'];

export function EditProfileScreen({ token, onSaved, onCancel }: Props) {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [banner, setBanner] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null);
  const [dirty, setDirty] = useState(false);

  const [displayName, setDisplayName] = useState('');
  const [handle, setHandle] = useState('');
  const [bio, setBio] = useState('');
  const [category, setCategory] = useState<string | null>(null);
  const [priceKsh, setPriceKsh] = useState('0');
  const [avatarKey, setAvatarKey] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [coverKey, setCoverKey] = useState<string | null>(null);
  const [coverUrl, setCoverUrl] = useState<string | null>(null);
  const [instagram, setInstagram] = useState('');
  const [tiktok, setTiktok] = useState('');
  const [youtube, setYoutube] = useState('');
  const [xHandle, setXHandle] = useState('');
  const [publicProfile, setPublicProfile] = useState(true);
  const [showVideos, setShowVideos] = useState(true);
  const [showLives, setShowLives] = useState(true);
  const [uploading, setUploading] = useState<'avatar' | 'cover' | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/creator/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error('Failed to load');
        const data = await res.json();
        const p: Profile | null = data?.profile ?? null;
        if (p) {
          setDisplayName(p.displayName);
          setHandle(p.handle);
          setBio(p.bio ?? '');
          setCategory(p.category);
          setPriceKsh(String(Math.round(p.subscriptionPriceMinor / 100)));
          setAvatarKey(p.avatarKey);
          setAvatarUrl(p.avatarUrl);
          setCoverKey(p.coverKey);
          setCoverUrl(p.coverUrl);
          setInstagram(p.instagram ?? '');
          setTiktok(p.tiktok ?? '');
          setYoutube(p.youtube ?? '');
          setXHandle(p.xHandle ?? '');
          setPublicProfile(p.publicProfile);
          setShowVideos(p.showVideos);
          setShowLives(p.showLives);
        }
      } catch {
        setBanner({ kind: 'err', text: 'Could not load profile' });
      } finally {
        setLoading(false);
      }
    })();
  }, [token]);

  const markDirty = () => setDirty(true);

  const pickImage = async (kind: 'avatar' | 'cover') => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      setBanner({ kind: 'err', text: 'Photo permission denied' });
      return;
    }
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: kind === 'avatar' ? [1, 1] : [16, 9],
      quality: 0.8,
    });
    if (res.canceled || !res.assets[0]) return;
    const asset = res.assets[0];
    const contentType = asset.mimeType ?? 'image/jpeg';
    setUploading(kind);
    try {
      const presignRes = await fetch(`${API_BASE}/creator/presign-image`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ kind, contentType }),
      });
      if (!presignRes.ok) throw new Error('presign failed');
      const presign = await presignRes.json();
      if (!presign.uploadUrl) throw new Error('R2 not configured');
      const blob = await (await fetch(asset.uri)).blob();
      const put = await fetch(presign.uploadUrl, {
        method: 'PUT',
        headers: { 'Content-Type': contentType },
        body: blob,
      });
      if (!put.ok) throw new Error('upload failed');
      if (kind === 'avatar') {
        setAvatarKey(presign.key);
        setAvatarUrl(presign.publicUrl);
      } else {
        setCoverKey(presign.key);
        setCoverUrl(presign.publicUrl);
      }
      markDirty();
    } catch (e: any) {
      setBanner({ kind: 'err', text: e?.message ?? 'Upload failed' });
    } finally {
      setUploading(null);
    }
  };

  const removeImage = (kind: 'avatar' | 'cover') => {
    if (kind === 'avatar') { setAvatarKey(null); setAvatarUrl(null); }
    else { setCoverKey(null); setCoverUrl(null); }
    markDirty();
  };

  const save = async () => {
    setSaving(true);
    setBanner(null);
    try {
      const body: any = {
        displayName: displayName.trim(),
        handle: handle.trim().toLowerCase(),
        bio: bio.trim() || null,
        category,
        avatarKey,
        coverKey,
        subscriptionPriceMinor: Math.round(Number(priceKsh) * 100),
        instagram: instagram.trim() || null,
        tiktok: tiktok.trim() || null,
        youtube: youtube.trim() || null,
        xHandle: xHandle.trim() || null,
        publicProfile,
        showVideos,
        showLives,
      };
      const res = await fetch(`${API_BASE}/creator/profile`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.code ?? 'Save failed');
      }
      setBanner({ kind: 'ok', text: 'Saved' });
      setDirty(false);
      setTimeout(() => onSaved(), 600);
    } catch (e: any) {
      setBanner({ kind: 'err', text: e?.message ?? 'Save failed' });
    } finally {
      setSaving(false);
    }
  };

  const back = () => {
    if (dirty) {
      Alert.alert('Discard changes?', 'Your changes will be lost.', [
        { text: 'Keep editing', style: 'cancel' },
        { text: 'Discard', style: 'destructive', onPress: onCancel },
      ]);
    } else {
      onCancel();
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.colors.bg, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color={theme.colors.primary} size="large" />
      </View>
    );
  }

  const inputStyle = {
    color: theme.colors.text,
    borderWidth: 2, borderColor: theme.colors.border,
    borderRadius: theme.radii.md,
    paddingHorizontal: 14, paddingVertical: 12,
    fontSize: 15,
  } as const;

  const sectionTitle = (text: string) => (
    <Text style={{ color: theme.colors.text, fontSize: 13, fontWeight: '900', letterSpacing: 1, textTransform: 'uppercase', opacity: 0.7, marginTop: 24, marginBottom: 8 }}>
      {text}
    </Text>
  );

  const toggleRow = (label: string, value: boolean, setValue: (v: boolean) => void) => (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: theme.colors.border }}>
      <Text style={{ color: theme.colors.text, fontSize: 14 }}>{label}</Text>
      <Switch
        value={value}
        onValueChange={(v) => { setValue(v); markDirty(); }}
        trackColor={{ true: theme.colors.primary, false: theme.colors.border }}
        thumbColor="#FFFFFF"
      />
    </View>
  );

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={{ flex: 1, backgroundColor: theme.colors.bg }}>
        {/* Header */}
        <View style={{
          paddingTop: insets.top + 12, paddingBottom: 12, paddingHorizontal: 16,
          flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
          borderBottomWidth: 2, borderBottomColor: theme.colors.border,
        }}>
          <Pressable onPress={back}><Icon.Back size={26} color={theme.colors.text} /></Pressable>
          <Text style={{ color: theme.colors.text, fontSize: 16, fontWeight: '800' }}>Edit profile</Text>
          <Pressable onPress={save} disabled={saving}>
            {saving ? <ActivityIndicator color={theme.colors.primary} /> :
              <Text style={{ color: theme.colors.primary, fontSize: 14, fontWeight: '900' }}>Save</Text>}
          </Pressable>
        </View>

        <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
          {/* COVER */}
          {sectionTitle('Cover photo')}
          <View style={{ height: 160, borderRadius: theme.radii.lg, overflow: 'hidden', backgroundColor: theme.colors.primary }}>
            {coverUrl ? (
              <Image source={{ uri: coverUrl }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
            ) : null}
            <View style={{ position: 'absolute', bottom: 8, right: 8, flexDirection: 'row', gap: 6 }}>
              <Pressable onPress={() => pickImage('cover')} disabled={uploading !== null} style={{ backgroundColor: 'rgba(0,0,0,0.65)', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999 }}>
                {uploading === 'cover' ? <ActivityIndicator color="#FFFFFF" size="small" /> :
                  <Text style={{ color: '#FFFFFF', fontWeight: '800', fontSize: 12 }}>{coverUrl ? 'Change' : 'Upload'}</Text>}
              </Pressable>
              {coverUrl ? (
                <Pressable onPress={() => removeImage('cover')} style={{ backgroundColor: 'rgba(255,0,0,0.85)', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999 }}>
                  <Text style={{ color: '#FFFFFF', fontWeight: '800', fontSize: 12 }}>Remove</Text>
                </Pressable>
              ) : null}
            </View>
          </View>

          {/* AVATAR */}
          {sectionTitle('Profile photo')}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
            <View style={{ width: 88, height: 88, borderRadius: 44, overflow: 'hidden', backgroundColor: theme.colors.surface, borderWidth: 2, borderColor: theme.colors.border, alignItems: 'center', justifyContent: 'center' }}>
              {avatarUrl ? (
                <Image source={{ uri: avatarUrl }} style={{ width: '100%', height: '100%' }} />
              ) : (
                <Text style={{ color: theme.colors.primary, fontSize: 28, fontWeight: '900' }}>
                  {(displayName || 'U').slice(0, 2).toUpperCase()}
                </Text>
              )}
            </View>
            <View style={{ gap: 8, flex: 1 }}>
              <Pressable onPress={() => pickImage('avatar')} disabled={uploading !== null} style={{ backgroundColor: theme.colors.primary, paddingVertical: 12, borderRadius: 999, alignItems: 'center' }}>
                {uploading === 'avatar' ? <ActivityIndicator color={theme.colors.onPrimary} /> :
                  <Text style={{ color: theme.colors.onPrimary, fontWeight: '800', fontSize: 13 }}>{avatarUrl ? 'Change photo' : 'Upload photo'}</Text>}
              </Pressable>
              {avatarUrl ? (
                <Pressable onPress={() => removeImage('avatar')} style={{ paddingVertical: 10, alignItems: 'center' }}>
                  <Text style={{ color: theme.colors.primary, fontWeight: '800', fontSize: 12 }}>Remove photo</Text>
                </Pressable>
              ) : null}
            </View>
          </View>

          {/* IDENTITY */}
          {sectionTitle('Identity')}
          <Text style={{ color: theme.colors.text, fontSize: 12, opacity: 0.7, marginBottom: 4 }}>Display name</Text>
          <TextInput value={displayName} onChangeText={(t) => { setDisplayName(t); markDirty(); }} maxLength={40} style={inputStyle} placeholder="Your display name" placeholderTextColor={theme.colors.textMuted} />

          <Text style={{ color: theme.colors.text, fontSize: 12, opacity: 0.7, marginTop: 12, marginBottom: 4 }}>Username / handle</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <Text style={{ color: theme.colors.text, fontSize: 16, fontWeight: '800' }}>@</Text>
            <TextInput
              value={handle}
              onChangeText={(t) => { setHandle(t.toLowerCase().replace(/[^a-z0-9_]/g, '')); markDirty(); }}
              maxLength={20}
              autoCapitalize="none"
              style={[inputStyle, { flex: 1 }]}
              placeholder="yourhandle"
              placeholderTextColor={theme.colors.textMuted}
            />
          </View>

          <Text style={{ color: theme.colors.text, fontSize: 12, opacity: 0.7, marginTop: 12, marginBottom: 4 }}>Bio</Text>
          <TextInput
            value={bio}
            onChangeText={(t) => { setBio(t); markDirty(); }}
            maxLength={200}
            multiline
            style={[inputStyle, { minHeight: 100, textAlignVertical: 'top' }]}
            placeholder="Tell fans about yourself"
            placeholderTextColor={theme.colors.textMuted}
          />
          <Text style={{ color: theme.colors.text, fontSize: 11, opacity: 0.5, textAlign: 'right', marginTop: 2 }}>{bio.length}/200</Text>

          <Text style={{ color: theme.colors.text, fontSize: 12, opacity: 0.7, marginTop: 12, marginBottom: 6 }}>Category</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {CATEGORIES.map((c) => {
              const active = category === c;
              return (
                <Pressable
                  key={c}
                  onPress={() => { setCategory(c); markDirty(); }}
                  style={{
                    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999,
                    borderWidth: 2,
                    borderColor: active ? theme.colors.primary : theme.colors.border,
                    backgroundColor: active ? theme.colors.primary : 'transparent',
                  }}
                >
                  <Text style={{ color: active ? theme.colors.onPrimary : theme.colors.text, fontWeight: '700', fontSize: 13, textTransform: 'capitalize' }}>{c}</Text>
                </Pressable>
              );
            })}
          </View>

          {/* SUBSCRIPTION */}
          {sectionTitle('Subscription')}
          <Text style={{ color: theme.colors.text, fontSize: 12, opacity: 0.7, marginBottom: 4 }}>Monthly price (KSh)</Text>
          <TextInput
            value={priceKsh}
            onChangeText={(t) => { setPriceKsh(t.replace(/[^0-9]/g, '')); markDirty(); }}
            keyboardType="number-pad"
            maxLength={6}
            style={inputStyle}
          />
          <View style={{ marginTop: 8, padding: 14, backgroundColor: theme.colors.surface, borderRadius: theme.radii.md, borderWidth: 2, borderColor: theme.colors.border }}>
            <Text style={{ color: theme.colors.text, fontSize: 11, opacity: 0.6, marginBottom: 4 }}>PREVIEW</Text>
            <Text style={{ color: theme.colors.primary, fontSize: 22, fontWeight: '900' }}>
              KSh {Number(priceKsh || 0).toLocaleString()} / month
            </Text>
          </View>

          {/* SOCIALS */}
          {sectionTitle('Social links (optional)')}
          {[
            { label: 'Instagram', value: instagram, set: setInstagram, placeholder: 'username' },
            { label: 'TikTok', value: tiktok, set: setTiktok, placeholder: 'username' },
            { label: 'YouTube', value: youtube, set: setYoutube, placeholder: 'channel' },
            { label: 'X', value: xHandle, set: setXHandle, placeholder: 'username' },
          ].map(({ label, value, set, placeholder }) => (
            <View key={label} style={{ marginBottom: 10 }}>
              <Text style={{ color: theme.colors.text, fontSize: 12, opacity: 0.7, marginBottom: 4 }}>{label}</Text>
              <TextInput
                value={value}
                onChangeText={(t) => { set(t); markDirty(); }}
                placeholder={placeholder}
                placeholderTextColor={theme.colors.textMuted}
                autoCapitalize="none"
                style={inputStyle}
              />
            </View>
          ))}

          {/* VISIBILITY */}
          {sectionTitle('Content visibility')}
          {toggleRow('Public profile', publicProfile, setPublicProfile)}
          {toggleRow('Show videos', showVideos, setShowVideos)}
          {toggleRow('Show scheduled lives', showLives, setShowLives)}

          {/* BANNER */}
          {banner ? (
            <View style={{
              marginTop: 20, padding: 14, borderRadius: theme.radii.md, borderWidth: 2,
              borderColor: banner.kind === 'ok' ? theme.colors.primary : theme.colors.danger,
            }}>
              <Text style={{ color: banner.kind === 'ok' ? theme.colors.primary : theme.colors.danger, fontWeight: '800', textAlign: 'center' }}>
                {banner.text}
              </Text>
            </View>
          ) : null}
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}
