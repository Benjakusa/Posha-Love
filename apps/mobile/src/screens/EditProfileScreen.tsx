import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, Image, ActivityIndicator,
  KeyboardAvoidingView, Platform, Switch, Alert, Pressable,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useTheme } from '../theme/ThemeProvider';
import { BackBar } from '../components/BackBar';
import { Input } from '../components/Input';
import { Chip } from '../components/Chip';
import { Button } from '../components/Button';
import { Avatar } from '../components/Avatar';
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
      base64: true,
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
      // Use base64 returned directly by the image picker — no file:// URI issues on Android.
      const b64 = asset.base64;
      if (!b64) throw new Error('No image data');
      const byteChars = atob(b64);
      const bytes = new Uint8Array(byteChars.length);
      for (let i = 0; i < byteChars.length; i++) bytes[i] = byteChars.charCodeAt(i);
      const blob = new Blob([bytes], { type: contentType });
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

  const sectionTitle = (text: string) => (
    <Text style={{ color: theme.colors.textMuted, fontSize: 13, fontWeight: '600', textTransform: 'uppercase', marginTop: 20, marginBottom: 8 }}>
      {text}
    </Text>
  );

  const toggleRow = (label: string, value: boolean, setValue: (v: boolean) => void) => (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: theme.colors.divider }}>
      <Text style={{ color: theme.colors.text, fontSize: 15 }}>{label}</Text>
      <Switch
        value={value}
        onValueChange={(v) => { setValue(v); markDirty(); }}
        trackColor={{ true: theme.colors.primary, false: theme.colors.border }}
        thumbColor={theme.colors.surface}
      />
    </View>
  );

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: theme.colors.bg }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <BackBar
        title="Edit profile"
        onBack={back}
        rightActionLabel={saving ? 'Saving…' : 'Save'}
        onRightAction={save}
      />

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
        {/* Cover */}
        {sectionTitle('Cover photo')}
        <View style={{ height: 160, borderRadius: theme.radii.lg, overflow: 'hidden', backgroundColor: theme.colors.surface }}>
          {coverUrl ? (
            <Image source={{ uri: coverUrl }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
          ) : null}
          <View style={{ position: 'absolute', bottom: 8, right: 8, flexDirection: 'row', gap: 6 }}>
            <Button
              label={uploading === 'cover' ? 'Uploading…' : coverUrl ? 'Change' : 'Upload'}
              variant="secondary"
              onPress={() => pickImage('cover')}
              disabled={uploading !== null}
              minHeight={36}
            />
            {coverUrl ? (
              <Button
                label="Remove"
                variant="destructive"
                onPress={() => removeImage('cover')}
                minHeight={36}
              />
            ) : null}
          </View>
        </View>

        {/* Avatar */}
        {sectionTitle('Profile photo')}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
          <Avatar uri={avatarUrl} name={displayName || 'U'} size={80} />
          <View style={{ gap: 8, flex: 1 }}>
            <Button
              label={uploading === 'avatar' ? 'Uploading…' : avatarUrl ? 'Change photo' : 'Upload photo'}
              onPress={() => pickImage('avatar')}
              disabled={uploading !== null}
              minHeight={40}
            />
            {avatarUrl ? (
              <Button label="Remove photo" variant="tertiary" onPress={() => removeImage('avatar')} minHeight={36} />
            ) : null}
          </View>
        </View>

        {/* Identity */}
        {sectionTitle('Identity')}
        <Input
          label="Display name"
          value={displayName}
          onChangeText={(t) => { setDisplayName(t); markDirty(); }}
          maxLength={40}
          placeholder="Your display name"
        />

        <View style={{ marginTop: 12 }}>
          <Input
            label="Username / handle"
            value={handle}
            onChangeText={(t) => { setHandle(t.toLowerCase().replace(/[^a-z0-9_]/g, '')); markDirty(); }}
            maxLength={20}
            autoCapitalize="none"
            placeholder="yourhandle"
          />
        </View>

        <View style={{ marginTop: 12 }}>
          <Input
            label="Bio"
            value={bio}
            onChangeText={(t) => { setBio(t); markDirty(); }}
            maxLength={200}
            multiline
            placeholder="Tell fans about yourself"
          />
        </View>

        {/* Category chips */}
        {sectionTitle('Category')}
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {CATEGORIES.map((c) => (
            <Chip
              key={c}
              label={c}
              selected={category === c}
              onPress={() => { setCategory(c); markDirty(); }}
            />
          ))}
        </View>

        {/* Subscription */}
        {sectionTitle('Subscription')}
        <Input
          label="Monthly price (KSh)"
          value={priceKsh}
          onChangeText={(t) => { setPriceKsh(t.replace(/[^0-9]/g, '')); markDirty(); }}
          keyboardType="number-pad"
          maxLength={6}
        />

        {/* Socials */}
        {sectionTitle('Social links (optional)')}
        <View style={{ gap: 10 }}>
          <Input label="Instagram" value={instagram} onChangeText={(t) => { setInstagram(t); markDirty(); }} placeholder="username" autoCapitalize="none" />
          <Input label="TikTok" value={tiktok} onChangeText={(t) => { setTiktok(t); markDirty(); }} placeholder="username" autoCapitalize="none" />
          <Input label="YouTube" value={youtube} onChangeText={(t) => { setYoutube(t); markDirty(); }} placeholder="channel" autoCapitalize="none" />
          <Input label="X" value={xHandle} onChangeText={(t) => { setXHandle(t); markDirty(); }} placeholder="username" autoCapitalize="none" />
        </View>

        {/* Visibility */}
        {sectionTitle('Content visibility')}
        {toggleRow('Public profile', publicProfile, setPublicProfile)}
        {toggleRow('Show videos', showVideos, setShowVideos)}
        {toggleRow('Show scheduled lives', showLives, setShowLives)}

        {/* Banner */}
        {banner ? (
          <View style={{
            marginTop: 20, padding: 12, borderRadius: theme.radii.lg,
            backgroundColor: theme.colors.surface,
            flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
          }}>
            {banner.kind === 'err' ? <Icon.Warning size={16} color={theme.colors.danger} /> : <Icon.Check size={16} color={theme.colors.primary} />}
            <Text style={{ color: banner.kind === 'ok' ? theme.colors.primaryText : theme.colors.danger, fontWeight: '600' }}>
              {banner.text}
            </Text>
          </View>
        ) : null}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
