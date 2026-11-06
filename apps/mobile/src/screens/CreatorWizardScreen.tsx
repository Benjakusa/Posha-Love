import React, { useState } from 'react';
import {
  View, Text, Pressable, ScrollView, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { useTheme } from '../theme/ThemeProvider';
import { BackBar } from '../components/BackBar';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { Avatar } from '../components/Avatar';
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
        setError('Could not prepare profile photo upload');
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
      setError('Could not compress or upload profile photo');
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
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: theme.colors.bg }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <BackBar
        title="Become a creator"
        onBack={step === 0 ? onCancel : () => setStep((step - 1) as Step)}
      />

      {/* Progress bar */}
      <View style={{ flexDirection: 'row', gap: 6, paddingHorizontal: 16, paddingTop: 12 }}>
        {steps.map((_, i) => (
          <View
            key={i}
            style={{
              flex: 1,
              height: 4,
              borderRadius: 2,
              backgroundColor: i <= step ? theme.colors.primary : theme.colors.border,
            }}
          />
        ))}
      </View>

      <ScrollView contentContainerStyle={{ padding: 24, gap: 16 }}>
        <Text style={{ color: theme.colors.textMuted, fontSize: 12, fontWeight: '600', textTransform: 'uppercase' }}>
          Step {step + 1} of 5 · {steps[step]}
        </Text>

        {step === 0 && (
          <View style={{ gap: 12 }}>
            <Text style={{ color: theme.colors.text, fontSize: 24, fontWeight: '700', lineHeight: 28 }}>
              What should fans call you?
            </Text>
            <Input
              value={displayName}
              onChangeText={setDisplayName}
              placeholder="Display name"
              maxLength={40}
            />
          </View>
        )}

        {step === 1 && (
          <View style={{ gap: 12 }}>
            <Text style={{ color: theme.colors.text, fontSize: 24, fontWeight: '700', lineHeight: 28 }}>
              Pick your handle
            </Text>
            <Text style={{ color: theme.colors.textMuted, fontSize: 15, lineHeight: 21 }}>
              3–20 characters. Lowercase letters, numbers, underscore.
            </Text>
            <Input
              value={handle}
              onChangeText={(t) => setHandle(t.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
              placeholder="yourhandle"
              autoCapitalize="none"
              maxLength={20}
            />
          </View>
        )}

        {step === 2 && (
          <View style={{ gap: 16 }}>
            <Text style={{ color: theme.colors.text, fontSize: 24, fontWeight: '700', lineHeight: 28 }}>
              Add a photo and bio
            </Text>
            <Pressable onPress={pickAvatar} style={{ alignSelf: 'center' }}>
              <Avatar uri={avatarUri} name={displayName} size={96} />
            </Pressable>
            <Text style={{ color: theme.colors.textMuted, fontSize: 13, textAlign: 'center' }}>
              {avatarUploading ? 'Uploading…' : avatarKey ? '✓ Uploaded' : 'Tap to choose a photo (optional)'}
            </Text>
            <Input
              value={bio}
              onChangeText={setBio}
              placeholder="Short bio (optional)"
              maxLength={200}
              multiline
            />
          </View>
        )}

        {step === 3 && (
          <View style={{ gap: 12 }}>
            <Text style={{ color: theme.colors.text, fontSize: 24, fontWeight: '700', lineHeight: 28 }}>
              Monthly subscription price
            </Text>
            <Text style={{ color: theme.colors.textMuted, fontSize: 15, lineHeight: 21 }}>
              Minimum KSh 100. Fans pay this to unlock all your videos.
            </Text>
            <Input
              value={price}
              onChangeText={(t) => setPrice(t.replace(/[^0-9]/g, ''))}
              keyboardType="number-pad"
              maxLength={6}
            />
          </View>
        )}

        {step === 4 && (
          <View style={{ gap: 16 }}>
            <Text style={{ color: theme.colors.text, fontSize: 24, fontWeight: '700', lineHeight: 28 }}>
              Before you continue
            </Text>

            <View style={{ gap: 10 }}>
              {[
                'You are 18 years or older.',
                'You own the rights to all content you upload.',
                'No content involving minors or non-consensual acts.',
                'No harassment, hate, or doxxing.',
                'Comply with POSHA rules and applicable law.',
              ].map((t) => (
                <View key={t} style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
                  <Icon.Check size={16} color={theme.colors.primaryText} />
                  <Text style={{ color: theme.colors.text, fontSize: 15, lineHeight: 20, flex: 1 }}>{t}</Text>
                </View>
              ))}
            </View>

            <Pressable
              onPress={() => setRulesAccepted((r) => !r)}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: rulesAccepted }}
              style={{
                backgroundColor: theme.colors.surface,
                borderRadius: theme.radii.lg,
                padding: 14,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 12,
                marginTop: 8,
              }}
            >
              <View
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: 6,
                  borderWidth: 1.5,
                  borderColor: rulesAccepted ? theme.colors.primary : theme.colors.border,
                  backgroundColor: rulesAccepted ? theme.colors.primary : 'transparent',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {rulesAccepted ? <Icon.Check size={14} color={theme.colors.onPrimary} /> : null}
              </View>
              <Text style={{ color: theme.colors.text, fontSize: 15, fontWeight: '600', flex: 1 }}>
                I accept the creator rules
              </Text>
            </Pressable>
          </View>
        )}

        {error ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Icon.Warning size={14} color={theme.colors.danger} />
            <Text style={{ color: theme.colors.danger, fontSize: 13, lineHeight: 18, flex: 1 }}>{error}</Text>
          </View>
        ) : null}
      </ScrollView>

      {/* Footer */}
      <View
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: theme.colors.bg,
          borderTopWidth: 1,
          borderTopColor: theme.colors.border,
          paddingHorizontal: 16,
          paddingTop: 12,
          paddingBottom: Math.max(insets.bottom, 16),
        }}
      >
        <Button
          label={submitting ? 'Submitting…' : step === 4 ? 'Submit application' : 'Continue'}
          onPress={step === 4 ? submit : () => setStep((step + 1) as Step)}
          disabled={!canNext || submitting}
          loading={submitting}
          minHeight={48}
        />
      </View>
    </KeyboardAvoidingView>
  );
}
