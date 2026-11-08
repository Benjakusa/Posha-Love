import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeProvider';
import { BackBar } from '../components/BackBar';
import { Button } from '../components/Button';
import { ListRow } from '../components/ListRow';
import { Icon } from '../icons';

type Props = { onApply: () => void; onBack: () => void };

export function CreatorBenefitsScreen({ onApply, onBack }: Props) {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();

  const benefits = [
    { title: 'Upload videos', body: 'Share exclusive videos behind a subscription wall.', icon: <Icon.Video size={20} color={theme.colors.icon} /> },
    { title: 'Schedule live sessions', body: 'Plan a session and go live when ready.', icon: <Icon.Calendar size={20} color={theme.colors.icon} /> },
    { title: 'Earn monthly', body: 'Keep 80% of subscription revenue.', icon: <Icon.Heart size={20} color={theme.colors.icon} /> },
    { title: 'Control your space', body: 'Mute, kick, or ban anyone.', icon: <Icon.Lock size={20} color={theme.colors.icon} /> },
    { title: 'Stay private', body: 'Only your chosen handle is public.', icon: <Icon.User size={20} color={theme.colors.icon} /> },
  ];

  const uploads = [
    'Video files (MP4, MOV)',
    'A poster image for each video',
    'A short title and description',
    'An explicit opt-in to content rules',
  ];

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.bg }}>
      <BackBar title="Become a creator" onBack={onBack} />

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 100, gap: 20 }}>
        {/* Hero card */}
        <View style={{ backgroundColor: theme.colors.surface, borderRadius: theme.radii.lg, padding: 20, gap: 12 }}>
          <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: theme.colors.primary, alignItems: 'center', justifyContent: 'center' }}>
            <Icon.Heart size={24} color="#FFFFFF" />
          </View>
          <Text style={{ color: theme.colors.text, fontSize: 24, fontWeight: '700', lineHeight: 28 }}>Create. Earn. Grow.</Text>
          <Text style={{ color: theme.colors.textMuted, fontSize: 15, lineHeight: 21 }}>POSHA is a place to share your world with people who value you.</Text>
        </View>

        {/* Section: What you get */}
        <View style={{ gap: 4 }}>
          <Text style={{ color: theme.colors.text, fontSize: 17, fontWeight: '700', lineHeight: 22, paddingHorizontal: 4, marginBottom: 4 }}>What you get</Text>
          {benefits.map((b, i) => (
            <ListRow
              key={b.title}
              title={b.title}
              subtitle={b.body}
              icon={b.icon}
              showChevron={false}
              showDivider={i < benefits.length - 1}
            />
          ))}
        </View>

        {/* Section: What you can upload */}
        <View style={{ gap: 12 }}>
          <Text style={{ color: theme.colors.text, fontSize: 17, fontWeight: '700', lineHeight: 22, paddingHorizontal: 4 }}>What you can upload</Text>
          <View style={{ gap: 10, paddingHorizontal: 4 }}>
            {uploads.map((u) => (
              <View key={u} style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <Icon.Check size={20} color={theme.colors.primaryText} />
                <Text style={{ color: theme.colors.text, fontSize: 15, lineHeight: 20, flex: 1 }}>{u}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Policy note */}
        <View
          style={{
            backgroundColor: theme.colors.accentSoft,
            borderRadius: theme.radii.lg,
            padding: 12,
            flexDirection: 'row',
            gap: 10,
            alignItems: 'flex-start',
          }}
        >
          <Icon.Bell size={18} color={theme.colors.primaryText} />
          <Text style={{ color: theme.colors.textMuted, fontSize: 12, lineHeight: 16, flex: 1 }}>No explicit content involving minors, non-consensual acts, or illegal activity. All uploads go through review before appearing in the feed.</Text>
        </View>
      </ScrollView>

      {/* Sticky bottom bar */}
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
        <Button label="Start creator application" onPress={onApply} minHeight={48} />
      </View>
    </View>
  );
}
