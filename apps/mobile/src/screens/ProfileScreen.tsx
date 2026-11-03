import React from 'react';
import { View, Text } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { Screen } from '../components/Screen';
import { Button } from '../components/Button';
import { Card } from '../components/Card';

type Props = { alias: string; onBack: () => void };

export function ProfileScreen({ alias, onBack }: Props) {
  const { theme } = useTheme();
  return (
    <Screen>
      <View style={{ gap: theme.spacing(4) }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <Button label="Back" onPress={onBack} variant="ghost" style={{ paddingHorizontal: 16, paddingVertical: 8 }} />
          <Text style={{ color: theme.colors.text, fontSize: theme.fontSizes.lg, fontWeight: '800' }}>Profile</Text>
        </View>
        <Card title={alias} subtitle="Guest · 18+ self-declared">
          <Text style={{ color: theme.colors.text, fontSize: theme.fontSizes.sm }}>
            You're exploring as a guest. Create an account to become a creator and publish videos.
          </Text>
        </Card>
        <Card title="Become a creator" subtitle="Share videos and get subscribers.">
          <Button label="Start creator signup" onPress={() => {}} />
        </Card>
      </View>
    </Screen>
  );
}
