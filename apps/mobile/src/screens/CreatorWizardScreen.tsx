import React, { useState } from 'react';
import {
  View, Text, TextInput, Pressable, ScrollView, KeyboardAvoidingView,
  Platform, Image, ActivityIndicator, Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { useTheme } from '../theme/ThemeProvider';
import { Icon } from '../icons';
import { API_BASE } from '../api';

const STEPS = [
  {
    title: 'What should fans call you?',
    hint: 'Your display name is shown on your profile and every post.',
    image: 'https://images.pexels.com/photos/10563851/pexels-photo-10563851.jpeg?w=1200',
    quote: 'Every creator starts with a name.',
  },
  {
    title: 'Pick your handle',
    hint: '3–20 characters. Lowercase letters, numbers, underscore.',
    image: 'https://images.pexels.com/photos/29382377/pexels-photo-29382377.jpeg?w=1200',
    quote: 'One handle. Everywhere.',
  },
  {
    title: 'Tell fans who you are',
    hint: 'A short bio and profile photo help fans connect.',
    image: 'https://images.pexels.com/photos/17879024/pexels-photo-17879024.jpeg?w=1200',
    quote: 'The first hello is everything.',
  },
  {
    title: 'What do you create?',
    hint: 'Pick the categories that fit your content.',
    image: 'https://images.pexels.com/photos/39569841/pexels-photo-39569841.jpeg?w=1200',
    quote: 'Show the world what you make.',
  },
  {
    title: 'Set your monthly price',
    hint: 'Fans pay this to unlock all your content for 30 days.',
    image: 'https://images.pexels.com/photos/7299866/pexels-photo-7299866.jpeg?w=1200',
    quote: 'Your time is worth something.',
  },
  {
    title: 'Before you begin',
    hint: 'Please confirm you agree to our creator rules.',
    image: 'https://images.pexels.com/photos/17879024/pexels-photo-17879024.jpeg?w=1200',
    quote: 'Rules keep everyone safe.',
  },
];

const CATEGORIES = ['music', 'fitness', 'comedy', 'education', 'lifestyle', 'fashion', 'travel', 'art', 'tech', 'gaming', 'food', 'other'];

type Props = { token: string; onDone: () => void; onCancel: () => void };

export function CreatorWizardScreen({ token, onDone, onCancel }: Props) {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const [step, setStep] = useState(0);
  const [displayName, setDisplayName] = useState('');
  const [handle, setHandle] = useState('');
  const [bio, setBio] = useState('');
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [avatarKey, setAvatarKey] = useState<string | null>(null);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [categories, setCategories] = useState<string[]>([]);
  const [price, setPrice] = useState('200');
  const [rules, setRules] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleCategory = (c: string) => {
    setCategories((prev) => prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]);
  };

  const pickAvatar = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) { setError('Photo permission denied'); return; }
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
      base64: true,
    });
    if (res.canceled || !res.assets[0]) return;
    const asset = res.assets[0];
    const contentType = asset.mimeType ?? 'image/jpeg';
    setAvatarUri(asset.uri);
    setAvatarUploading(true);
    try {
      const presignRes = await fetch(`${API_BASE}/creator/presign-image`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ kind: 'avatar', contentType }),
      });
      if (!presignRes.ok) throw new Error('presign failed');
      const presign = await presignRes.json();
      if (!presign.uploadUrl) throw new Error('R2 not configured');
      if (!asset.base64) throw new Error('No image data');
      const byteChars = atob(asset.base64);
      const bytes = new Uint8Array(byteChars.length);
      for (let i = 0; i < byteChars.length; i++) bytes[i] = byteChars.charCodeAt(i);
      const blob = new Blob([bytes], { type: contentType });
      const put = await fetch(presign.uploadUrl, { method: 'PUT', headers: { 'Content-Type': contentType }, body: blob });
      if (!put.ok) throw new Error('upload failed');
      setAvatarKey(presign.key);
    } catch (e: any) {
      setError(e?.message ?? 'Upload failed');
    } finally { setAvatarUploading(false); }
  };

  const canNext = (() => {
    if (step === 0) return displayName.trim().length >= 2;
    if (step === 1) return /^[a-z0-9_]{3,20}$/.test(handle.trim());
    if (step === 2) return true;
    if (step === 3) return categories.length > 0;
    if (step === 4) return Number(price) >= 100;
    if (step === 5) return rules;
    return false;
  })();

  const submit = async () => {
    setSubmitting(true); setError(null);
    try {
      const body: any = {
        displayName: displayName.trim(),
        handle: handle.trim().toLowerCase(),
        bio: bio.trim() || null,
        avatarKey,
        categories,
        subscriptionPriceMinor: Math.round(Number(price) * 100),
      };
      // First, create the application (creates Creator row, auto-approved)
      const applyRes = await fetch(`${API_BASE}/creator/apply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ ...body, rulesAccepted: true }),
      });
      if (!applyRes.ok) {
        const err = await applyRes.json().catch(() => ({}));
        throw new Error(err.code ?? 'Apply failed');
      }
      // Then patch with extra fields (categories, avatarKey)
      await fetch(`${API_BASE}/creator/profile`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
      });
      onDone();
    } catch (e: any) {
      setError(e?.message ?? 'Submit failed');
    } finally { setSubmitting(false); }
  };

  const stepData = STEPS[step];
  const progress = ((step + 1) / STEPS.length) * 100;

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={{ flex: 1, backgroundColor: theme.colors.bg }}>
        {/* TOP: image + quote */}
        <View style={{ height: '45%', backgroundColor: '#000' }}>
          <Image source={{ uri: stepData.image }} style={{ width: '100%', height: '100%', position: 'absolute' }} resizeMode="cover" />
          <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.45)' }} />
          <Pressable onPress={step === 0 ? onCancel : () => setStep((s) => s - 1)} style={{ position: 'absolute', top: insets.top + 12, left: 16, width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center' }}>
            <Icon.Back size={22} color="#FFFFFF" />
          </Pressable>
          <View style={{ position: 'absolute', bottom: 24, left: 24, right: 24 }}>
            <View style={{ width: 40, height: 3, backgroundColor: theme.colors.primary, marginBottom: 12 }} />
            <Text style={{ color: '#FFFFFF', fontSize: 22, fontWeight: '900', fontStyle: 'italic', lineHeight: 28 }}>
              "{stepData.quote}"
            </Text>
          </View>
        </View>

        {/* BOTTOM: form card */}
        <View style={{ flex: 1, backgroundColor: theme.colors.bg, borderTopLeftRadius: 24, borderTopRightRadius: 24, marginTop: -20, paddingTop: 20, paddingHorizontal: 24 }}>
          {/* Progress dots */}
          <View style={{ flexDirection: 'row', gap: 4, marginBottom: 16 }}>
            {STEPS.map((_, i) => (
              <View key={i} style={{ flex: 1, height: 3, borderRadius: 2, backgroundColor: i <= step ? theme.colors.primary : theme.colors.border }} />
            ))}
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
            <Text style={{ color: theme.colors.textMuted, fontSize: 12, fontWeight: '800', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 6 }}>
              Step {step + 1} of {STEPS.length}
            </Text>
            <Text style={{ color: theme.colors.text, fontSize: 24, fontWeight: '900', marginBottom: 6 }}>{stepData.title}</Text>
            <Text style={{ color: theme.colors.textMuted, fontSize: 14, marginBottom: 20 }}>{stepData.hint}</Text>

            {step === 0 ? (
              <TextInput
                value={displayName}
                onChangeText={setDisplayName}
                placeholder="e.g. Amara K"
                placeholderTextColor={theme.colors.textMuted}
                maxLength={40}
                style={inputStyle(theme)}
              />
            ) : null}

            {step === 1 ? (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Text style={{ color: theme.colors.text, fontSize: 18, fontWeight: '800' }}>@</Text>
                <TextInput
                  value={handle}
                  onChangeText={(t) => setHandle(t.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                  placeholder="yourhandle"
                  placeholderTextColor={theme.colors.textMuted}
                  autoCapitalize="none"
                  maxLength={20}
                  style={[inputStyle(theme), { flex: 1 }]}
                />
              </View>
            ) : null}

            {step === 2 ? (
              <View style={{ gap: 16 }}>
                <View style={{ alignItems: 'center', gap: 8 }}>
                  <Pressable onPress={pickAvatar} style={{ width: 100, height: 100, borderRadius: 50, backgroundColor: theme.colors.bg, borderWidth: 2, borderColor: theme.colors.border, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                    {avatarUri ? (
                      <Image source={{ uri: avatarUri }} style={{ width: '100%', height: '100%' }} />
                    ) : (
                      <Icon.User size={40} color={theme.colors.primary} />
                    )}
                  </Pressable>
                  <Text style={{ color: theme.colors.textMuted, fontSize: 12 }}>
                    {avatarUploading ? 'Uploading…' : avatarKey ? '✓ Photo ready' : 'Tap to upload profile photo (optional)'}
                  </Text>
                </View>
                <TextInput
                  value={bio}
                  onChangeText={setBio}
                  placeholder="Short bio — who are you, what do you create?"
                  placeholderTextColor={theme.colors.textMuted}
                  maxLength={200}
                  multiline
                  style={[inputStyle(theme), { minHeight: 100, textAlignVertical: 'top' }]}
                />
                <Text style={{ color: theme.colors.textMuted, fontSize: 11, textAlign: 'right' }}>{bio.length}/200</Text>
              </View>
            ) : null}

            {step === 3 ? (
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                {CATEGORIES.map((c) => {
                  const active = categories.includes(c);
                  return (
                    <Pressable
                      key={c}
                      onPress={() => toggleCategory(c)}
                      style={{
                        paddingHorizontal: 14, paddingVertical: 10, borderRadius: 999,
                        borderWidth: 2,
                        borderColor: active ? theme.colors.primary : theme.colors.border,
                        backgroundColor: active ? theme.colors.primary : 'transparent',
                      }}
                    >
                      <Text style={{ color: active ? theme.colors.onPrimary : theme.colors.text, fontSize: 13, fontWeight: '700', textTransform: 'capitalize' }}>
                        {c}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            ) : null}

            {step === 4 ? (
              <View style={{ gap: 12 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Text style={{ color: theme.colors.text, fontSize: 22, fontWeight: '800' }}>KSh</Text>
                  <TextInput
                    value={price}
                    onChangeText={(t) => setPrice(t.replace(/[^0-9]/g, ''))}
                    keyboardType="number-pad"
                    maxLength={6}
                    style={[inputStyle(theme), { flex: 1, fontSize: 24, fontWeight: '800' }]}
                  />
                  <Text style={{ color: theme.colors.textMuted, fontSize: 14 }}>/ month</Text>
                </View>
                <View style={{ padding: 14, backgroundColor: theme.mode === 'light' ? '#F5F6F8' : theme.colors.surface, borderRadius: theme.radii.md }}>
                  <Text style={{ color: theme.colors.textMuted, fontSize: 11, fontWeight: '800', letterSpacing: 1 }}>PREVIEW</Text>
                  <Text style={{ color: theme.colors.primary, fontSize: 22, fontWeight: '900', marginTop: 4 }}>
                    KSh {Number(price || 0).toLocaleString()} / month
                  </Text>
                </View>
              </View>
            ) : null}

            {step === 5 ? (
              <View style={{ gap: 12 }}>
                {['I am 18 years or older', 'I own the rights to what I upload', 'No content involving minors or non-consent', 'No harassment, hate, or doxxing', 'I will follow POSHA\'s creator rules'].map((t) => (
                  <View key={t} style={{ flexDirection: 'row', gap: 8 }}>
                    <Text style={{ color: theme.colors.primary, fontWeight: '900' }}>•</Text>
                    <Text style={{ color: theme.colors.text, fontSize: 14, flex: 1 }}>{t}</Text>
                  </View>
                ))}
                <Pressable onPress={() => setRules((r) => !r)} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 8 }}>
                  <View style={{ width: 24, height: 24, borderRadius: 6, borderWidth: 2, borderColor: rules ? theme.colors.primary : theme.colors.border, backgroundColor: rules ? theme.colors.primary : 'transparent', alignItems: 'center', justifyContent: 'center' }}>
                    {rules ? <Text style={{ color: theme.colors.onPrimary, fontWeight: '900', fontSize: 14 }}>✓</Text> : null}
                  </View>
                  <Text style={{ color: theme.colors.text, fontSize: 14, fontWeight: '700' }}>I accept the creator rules</Text>
                </Pressable>
              </View>
            ) : null}

            {error ? <Text style={{ color: theme.colors.danger, fontSize: 13, marginTop: 16 }}>{error}</Text> : null}
          </ScrollView>
        </View>

        {/* Sticky footer */}
        <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: 16, paddingBottom: Math.max(insets.bottom, 16), backgroundColor: theme.colors.bg, borderTopWidth: 1, borderTopColor: theme.colors.border }}>
          <Pressable
            onPress={step === STEPS.length - 1 ? submit : () => setStep((s) => s + 1)}
            disabled={!canNext || submitting}
            style={{ backgroundColor: canNext && !submitting ? theme.colors.primary : theme.colors.border, paddingVertical: 16, borderRadius: 999, alignItems: 'center' }}
          >
            {submitting ? <ActivityIndicator color={theme.colors.onPrimary} /> : (
              <Text style={{ color: theme.colors.onPrimary, fontSize: 16, fontWeight: '900' }}>
                {step === STEPS.length - 1 ? 'Create my creator profile' : 'Continue'}
              </Text>
            )}
          </Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

function inputStyle(theme: any) {
  return {
    color: theme.colors.text,
    backgroundColor: theme.mode === 'light' ? '#F5F6F8' : theme.colors.surface,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    // Shadow outline instead of hard border
    shadowColor: theme.mode === 'light' ? '#000000' : '#FFFFFF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: theme.mode === 'light' ? 0.08 : 0.12,
    shadowRadius: 6,
    elevation: theme.mode === 'light' ? 2 : 0,
    // Hairline border so elevation-less devices (or web) still see the edge
    borderWidth: 1,
    borderColor: theme.mode === 'light' ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.10)',
  };
}
