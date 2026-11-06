import React from 'react';
import { View } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';

export function AppBackground({ children }: { children: React.ReactNode }) {
  const { theme } = useTheme();

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.bg }}>
      {children}
    </View>
  );
}
