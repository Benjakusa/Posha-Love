import React, { useState } from 'react';
import {
  View, Text, TextInput, Pressable, ScrollView, KeyboardAvoidingView,
  Platform, Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { useTheme } from '../theme/ThemeProvider';
import { Icon } from '../icons';
import { presignAvatar, uploadAvatarToR2, applyAsCreator } from '../api';

type Props = { token: string; onDone: () => void; onCancel: () => void };

type Step = 0 | 1 | 2 | 3 | 4;

export function CreatorWizardScreen({ token, onDone, onCancel }: Props) {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const [step, setStep] = useState<Step>(0);

  const [displayName, setDisplayName] = useState('');
  const [handle, setHandle] = useState('');
  const [bio, setBio] = useState('');
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [avatarKey, setAvatarKey] = useState<string | null>(null);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [price, setPrice] = useState('200');
  const [rulesAccepted, setRulesAccepted] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const steps = ['Name', 'Handle', 'About', 'Price', 'Rules'];

  const pickAvatar = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      setError('Photo permission denied');
      return;
    }

    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 1,
      allowsEditing: true,
      aspect: [1, 1],
    });

    if (res.canceled || !res.assets[0]) return;

    setAvatarUploading(true);
    setError(null);

    try {
      const compressed = await ImageManipulator.manipulateAsync(
        res.assets[0].uri,
        [{ resize: { width: 1200 } }],
        {
          compress: 0.78,
          format: ImageManipulator.SaveFormat.JPEG,
        },
      );

      const contentType = 'image/jpeg';
      setAvatarUri(compressed.uri);

      const presign = await presignAvatar(token, contentType);
      if (!presign) {
        setAvatarKey(null);
        setError('Could not prepare the profile photo upload');
        return;
      }

      const uploaded = await uploadAvatarToR2(
        presign.uploadUrl,
        compressed.uri,
        contentType,
      );

      if (!uploaded) {
        setAvatarKey(null);
        setError('Profile photo upload failed. Please try again.');
        return;
      }

      setAvatarKey(presign.key);
    } catch (error) {
      setAvatarKey(null);
      setError('Could not compress or upload the profile photo');
      console.error('[CreatorWizard] avatar upload failed:', error);
    } finally {
      setAvatarUploading(false);
    }
  };

  const canNext = (() => {
    if (step === 0) return displayName.trim().length >= 2;
    if (step === 1) return /^[a-z0-9_]{3,20}$/.test(handle.trim());
    if (step === 2) return true;
    if (step === 3) return Number(price) >= 100;
    if (step === 4) return rulesAccepted;
    return false;
  })();

  const submit = async () => {
    setSubmitting(true);
    setError(null);
    try {
      try { const parts = token.split("."); const payload = JSON.parse(atob(parts[1].replace(/-/g,"+").replace(/_/g,"/"))); console.log("SUBMIT DEBUG token role=", payload.role, "sub=", payload.sub); } catch(e) { console.log("SUBMIT DEBUG decode failed", String(e)); }
      const result = await applyAsCreator(token, {
        displayName: displayName.trim(),
        handle: handle.trim().toLowerCase(),
        bio: bio.trim() || undefined,
        avatarKey: avatarKey ?? undefined,
        subscriptionPriceMinor: Math.round(Number(price) * 100),
        rulesAccepted: true,
      });
      if ('error' in result) {
        setError(result.error === 'HANDLE_TAKEN' ? 'That handle is taken. Try another.' : result.error);
      } else {
        onDone();
      }
    } catch {
      setError('Could not submit application');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={{ flex: 1, backgroundColor: theme.colors.bg }}>
        {/* Header */}
        <View style={{
          paddingTop: insets.top + 12, paddingBottom: 12, paddingHorizontal: 16,
          flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
          borderBottomWidth: 2, borderBottomColor: theme.colors.border,
        }}>
          <Pressable onPress={step === 0 ? onCancel : () => setStep((step - 1) as Step)}>
            <Icon.Back size={26} color={theme.colors.text} />
          </Pressable>
          <Text style={{ color: theme.colors.text, fontSize: 15, fontWeight: '800' }}>
            Become a creator
          </Text>
          <View style={{ width: 26 }} />
        </View>

        {/* Progress */}
        <View style={{ flexDirection: 'row', gap: 6, paddingHorizontal: 16, paddingTop: 16 }}>
          {steps.map((_, i) => (
            <View key={i} style={{
              flex: 1, height: 4, borderRadius: 2,
              backgroundColor: i <= step ? theme.colors.primary : theme.colors.border,
            }} />
          ))}
        </View>

        <ScrollView contentContainerStyle={{ padding: 24, gap: 16 }}>
          <Text style={{ color: theme.colors.text, fontSize: 12, fontWeight: '800', letterSpacing: 1, textTransform: 'uppercase', opacity: 0.6 }}>
            Step {step + 1} of 5 · {steps[step]}
          </Text>

          {step === 0 && (
            <>
              <Text style={{ color: theme.colors.text, fontSize: 24, fontWeight: '900' }}>What should fans call you?</Text>
              <TextInput
                value={displayName}
                onChangeText={setDisplayName}
                placeholder="Display name"
                placeholderTextColor={theme.colors.text}
                maxLength={40}
                style={inputStyle(theme)}
              />
            </>
          )}

          {step === 1 && (
            <>
              <Text style={{ color: theme.colors.text, fontSize: 24, fontWeight: '900' }}>Pick your handle</Text>
              <Text style={{ color: theme.colors.text, fontSize: 13, opacity: 0.7 }}>
                3–20 characters. Lowercase letters, numbers, underscore.
              </Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <Text style={{ color: theme.colors.text, fontSize: 16, fontWeight: '800' }}>@</Text>
                <TextInput
                  value={handle}
                  onChangeText={(t) => setHandle(t.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                  placeholder="yourname"
                  placeholderTextColor={theme.colors.text}
                  autoCapitalize="none"
                  maxLength={20}
                  style={[inputStyle(theme), { flex: 1 }]}
                />
              </View>
            </>
          )}

          {step === 2 && (
            <>
              <Text style={{ color: theme.colors.text, fontSize: 24, fontWeight: '900' }}>Add a photo and bio</Text>
              <Pressable onPress={pickAvatar} style={{
                alignSelf: 'center', width: 120, height: 120, borderRadius: 60,
                backgroundColor: theme.colors.surface, borderWidth: 2, borderColor: theme.colors.border,
                alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
              }}>
                {avatarUri ? (
                  <Image source={{ uri: avatarUri }} style={{ width: '100%', height: '100%' }} />
                ) : (
                  <Icon.User size={48} color={theme.colors.primary} />
                )}
              </Pressable>
              <Text style={{ color: theme.colors.text, fontSize: 12, textAlign: 'center', opacity: 0.6 }}>
                {avatarUploading ? 'Uploading…' : avatarKey ? '✓ Uploaded' : 'Tap to choose a photo (optional)'}
              </Text>
              <TextInput
                value={bio}
                onChangeText={setBio}
                placeholder="Short bio (optional)"
                placeholderTextColor={theme.colors.text}
                maxLength={200}
                multiline
                style={[inputStyle(theme), { minHeight: 100, textAlignVertical: 'top' }]}
              />
            </>
          )}

          {step === 3 && (
            <>
              <Text style={{ color: theme.colors.text, fontSize: 24, fontWeight: '900' }}>Monthly subscription price</Text>
              <Text style={{ color: theme.colors.text, fontSize: 13, opacity: 0.7 }}>
                Minimum KSh 100. Fans pay this to unlock all your videos.
              </Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Text style={{ color: theme.colors.text, fontSize: 20, fontWeight: '800' }}>KSh</Text>
                <TextInput
                  value={price}
                  onChangeText={(t) => setPrice(t.replace(/[^0-9]/g, ''))}
                  keyboardType="number-pad"
                  maxLength={6}
                  style={[inputStyle(theme), { flex: 1, fontSize: 24, fontWeight: '800' }]}
                />
              </View>
            </>
          )}

          {step === 4 && (
            <>
              <Text style={{ color: theme.colors.text, fontSize: 24, fontWeight: '900' }}>Before you continue</Text>
              <View style={{ gap: 12 }}>
                {[
                  'You are 18 years or older.',
                  'You own the rights to all content you upload.',
                  'No content involving minors, non-consensual acts, or illegal activity.',
                  'No harassment, hate, or doxxing.',
                  'You will comply with POSHA\'s creator rules and applicable law.',
                ].map((t) => (
                  <View key={t} style={{ flexDirection: 'row', gap: 8 }}>
                    <Text style={{ color: theme.colors.primary, fontWeight: '800' }}>•</Text>
                    <Text style={{ color: theme.colors.text, fontSize: 14, flex: 1 }}>{t}</Text>
                  </View>
                ))}
              </View>
              <Pressable
                onPress={() => setRulesAccepted((r) => !r)}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: rulesAccepted }}
                style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 12, paddingVertical: 8 }}
              >
                <View style={{
                  width: 28, height: 28, borderRadius: 8, borderWidth: 2, borderColor: theme.colors.border,
                  backgroundColor: rulesAccepted ? theme.colors.primary : 'transparent',
                  alignItems: 'center', justifyContent: 'center',
                }}>
                  {rulesAccepted ? <Icon.Check size={16} color={theme.colors.onPrimary} /> : null}
                </View>
                <Text style={{ color: theme.colors.text, fontSize: 14, fontWeight: '700', flex: 1 }}>
                  I accept the creator rules
                </Text>
              </Pressable>
            </>
          )}

          {error ? (
            <Text style={{ color: theme.colors.danger, fontSize: 13 }}>{error}</Text>
          ) : null}
        </ScrollView>

        {/* Footer */}
        <View style={{
          padding: 16, paddingBottom: Math.max(insets.bottom, 16),
          borderTopWidth: 2, borderTopColor: theme.colors.border,
        }}>
          <Pressable
            onPress={step === 4 ? submit : () => setStep((step + 1) as Step)}
            disabled={!canNext || submitting}
            style={{
              backgroundColor: canNext && !submitting ? theme.colors.primary : theme.colors.border,
              paddingVertical: 16, borderRadius: 999, alignItems: 'center',
            }}
          >
            <Text style={{ color: theme.colors.onPrimary, fontSize: 16, fontWeight: '800' }}>
              {submitting ? 'Submitting…' : step === 4 ? 'Submit application' : 'Continue'}
            </Text>
          </Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

function inputStyle(theme: ReturnType<typeof useTheme>['theme']) {
  return {
    color: theme.colors.text,
    borderWidth: 2,
    borderColor: theme.colors.border,
    borderRadius: theme.radii.md,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
  } as const;
}
