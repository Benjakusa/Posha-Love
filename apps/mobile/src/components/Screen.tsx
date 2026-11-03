import React from 'react';
import { SafeAreaView, ScrollView, View, type ViewStyle } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';

type Props = {
  children: React.ReactNode;
  scroll?: boolean;
  padded?: boolean;
  style?: ViewStyle;
  contentStyle?: ViewStyle;
};

export function Screen({ children, scroll = true, padded = true, style, contentStyle }: Props) {
  const { theme } = useTheme();
  const inner = (
    <View
      style={[
        { flex: 1, paddingHorizontal: padded ? 24 : 0, paddingVertical: padded ? 24 : 0 },
        contentStyle,
      ]}
    >
      {children}
    </View>
  );
  return (
    <SafeAreaView style={[{ flex: 1, backgroundColor: theme.colors.bg }, style]}>
      {scroll ? (
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
          {inner}
        </ScrollView>
      ) : (
        inner
      )}
    </SafeAreaView>
  );
}
