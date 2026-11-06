import React from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeProvider';
import { Icon } from '../icons';

type Props = { onApply: () => void; onBack: () => void };

export function CreatorBenefitsScreen({ onApply, onBack }: Props) {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();

  const benefits = [
    { title: 'Upload videos', body: 'Share exclusive videos behind a subscription wall. Fans unlock with a monthly payment.' },
    { title: 'Schedule live sessions', body: 'Plan a session, notify your subscribers, go live when you\'re ready.' },
    { title: 'Earn monthly', body: 'Keep 80% of subscription revenue. Paid out after a 7-day hold.' },
    { title: 'Control your space', body: 'Mute, kick, or ban anyone. End a session in one tap.' },
    { title: 'Stay private', body: 'Your real identity stays with POSHA. Only your chosen handle is public.' },
  ];

  const uploads = [
    'Video files (MP4, MOV)',
    'A poster image for each video',
    'A short title and description',
    'An explicit opt-in to your content rules',
  ];

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: theme.colors.bg }}
      contentContainerStyle={{ padding: 24, paddingTop: insets.top + 16, gap: 20 }}
    >
      <Pressable onPress={onBack}>
        <Icon.Back size={26} color={theme.colors.text} />
      </Pressable>

      <View style={{ width: 60, height: 3, backgroundColor: theme.colors.primary }} />
      <Text style={{ color: theme.colors.text, fontSize: 36, fontWeight: '900', lineHeight: 40 }}>
        Create.{'\n'}Earn.{'\n'}Grow.
      </Text>
      <Text style={{ color: theme.colors.text, fontSize: 15, opacity: 0.75 }}>
        POSHA is a place to share your world with people who value you.
      </Text>

      <Text style={{ color: theme.colors.text, fontSize: 18, fontWeight: '800', marginTop: 8 }}>
        What you get
      </Text>
      {benefits.map((b) => (
        <View key={b.title} style={{
          borderWidth: 2, borderColor: theme.colors.border,
          borderRadius: theme.radii.md, padding: 16, gap: 6,
        }}>
          <Text style={{ color: theme.colors.text, fontSize: 15, fontWeight: '800' }}>{b.title}</Text>
          <Text style={{ color: theme.colors.text, fontSize: 13, opacity: 0.75 }}>{b.body}</Text>
        </View>
      ))}

      <Text style={{ color: theme.colors.text, fontSize: 18, fontWeight: '800', marginTop: 8 }}>
        What you can upload
      </Text>
      {uploads.map((u) => (
        <View key={u} style={{ flexDirection: 'row', gap: 8 }}>
          <Text style={{ color: theme.colors.primary, fontWeight: '800' }}>•</Text>
          <Text style={{ color: theme.colors.text, fontSize: 14, flex: 1 }}>{u}</Text>
        </View>
      ))}

      <Text style={{ color: theme.colors.text, fontSize: 12, opacity: 0.6, marginTop: 8 }}>
        No explicit content involving minors, non-consensual acts, or illegal activity. All uploads go through review before they appear in the feed.
      </Text>

      <Pressable
        onPress={onApply}
        style={{
          backgroundColor: theme.colors.primary,
          paddingVertical: 16, borderRadius: 999, alignItems: 'center', marginTop: 8,
        }}
      >
        <Text style={{ color: theme.colors.onPrimary, fontSize: 16, fontWeight: '800' }}>
          Start creator application
        </Text>
      </Pressable>
    </ScrollView>
  );
}
