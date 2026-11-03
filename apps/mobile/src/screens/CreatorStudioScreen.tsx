import React from 'react';
import { View, Text } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { Screen } from '../components/Screen';
import { Button } from '../components/Button';
import { Card } from '../components/Card';

type Props = { onBack: () => void };

export function CreatorStudioScreen({ onBack }: Props) {
  const { theme } = useTheme();
  return (
    <Screen>
      <View style={{ gap: theme.spacing(4) }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <Button label="Back" onPress={onBack} variant="ghost" style={{ paddingHorizontal: 16, paddingVertical: 8 }} />
          <Text style={{ color: theme.colors.text, fontSize: theme.fontSizes.lg, fontWeight: '800' }}>Creator studio</Text>
        </View>
        <Card title="Subscribers" subtitle="0" />
        <Card title="Earnings" subtitle="KSh 0.00" />
        <Card title="Upload video" subtitle="Uploads go through review before they appear.">
          <Button label="Choose file" onPress={() => {}} />
        </Card>
        <Card title="Schedule a live" subtitle="Notify your subscribers when it starts.">
          <Button label="Schedule" onPress={() => {}} />
        </Card>
      </View>
    </Screen>
  );
}
