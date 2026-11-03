import React from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { Screen } from '../components/Screen';
import { Icon } from '../icons';

type Props = { onHome: () => void; onProfile: () => void; onSettings: () => void };

const VIDEOS = [
  { id: 'v1', title: 'Late night talk', creator: '@amara', price: 'KSh 200' },
  { id: 'v2', title: 'Coffee & questions', creator: '@juma', price: 'KSh 150' },
  { id: 'v3', title: 'Sunday thoughts', creator: '@nia', price: 'KSh 300' },
  { id: 'v4', title: 'Street sounds', creator: '@kev', price: 'KSh 100' },
  { id: 'v5', title: 'Quiet hours', creator: '@zawadi', price: 'KSh 180' },
  { id: 'v6', title: 'City lights', creator: '@tai', price: 'KSh 120' },
];

export function ExploreScreen({ onHome, onProfile, onSettings }: Props) {
  const { theme } = useTheme();
  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.bg }}>
      <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 100, gap: 16 }} showsVerticalScrollIndicator={false}>
        <Text style={{ color: theme.colors.text, fontSize: theme.fontSizes.xxl, fontWeight: '900' }}>Explore</Text>
        <Text style={{ color: theme.colors.text, fontSize: theme.fontSizes.sm }}>
          All creator videos. Locked until you subscribe.
        </Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
          {VIDEOS.map((v) => (
            <View key={v.id} style={{ width: '48%', gap: 8 }}>
              <View style={{
                aspectRatio: 1,
                backgroundColor: theme.colors.lockedTile,
                borderRadius: theme.radii.md,
                alignItems: 'center', justifyContent: 'center',
              }}>
                <Icon.Lock size={28} color="#FFFFFF" />
              </View>
              <Text numberOfLines={1} style={{ color: theme.colors.text, fontSize: theme.fontSizes.sm, fontWeight: '700' }}>{v.title}</Text>
              <Text style={{ color: theme.colors.text, fontSize: theme.fontSizes.xs }}>{v.creator} · {v.price}</Text>
            </View>
          ))}
        </View>
      </ScrollView>

      <View style={{
        position: 'absolute', left: 0, right: 0, bottom: 0,
        backgroundColor: theme.colors.bg, borderTopWidth: 2, borderTopColor: theme.colors.border,
        flexDirection: 'row', justifyContent: 'space-around', paddingTop: 12, paddingBottom: 24,
      }}>
        <Pressable onPress={onHome} style={{ alignItems: 'center', gap: 4 }}><Icon.Home size={22} /><Text style={{ fontSize: 11, color: theme.colors.text, fontWeight: '700' }}>Home</Text></Pressable>
        <Pressable style={{ alignItems: 'center', gap: 4 }}><Icon.Explore size={22} /><Text style={{ fontSize: 11, color: theme.colors.text, fontWeight: '700' }}>Explore</Text></Pressable>
        <Pressable onPress={onProfile} style={{ alignItems: 'center', gap: 4 }}><Icon.User size={22} /><Text style={{ fontSize: 11, color: theme.colors.text, fontWeight: '700' }}>Profile</Text></Pressable>
        <Pressable onPress={onSettings} style={{ alignItems: 'center', gap: 4 }}><Icon.Settings size={22} /><Text style={{ fontSize: 11, color: theme.colors.text, fontWeight: '700' }}>Settings</Text></Pressable>
      </View>
    </View>
  );
}
