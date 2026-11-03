import React from 'react';
import { View, ImageBackground, StyleSheet } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';

const BG_IMAGE =
  'https://images.pexels.com/photos/7299866/pexels-photo-7299866.jpeg?w=1400';

export function AppBackground({ children }: { children: React.ReactNode }) {
  const { theme } = useTheme();
  // Background overlay is 89% transparent => photo shows through at ~11% opacity.
  // In light mode, overlay = white at 89% alpha. In dark mode, overlay = black at 89% alpha.
  const overlay = theme.mode === 'light'
    ? 'rgba(255,255,255,0.89)'
    : 'rgba(0,0,0,0.89)';

  return (
    <View style={[styles.root, { backgroundColor: theme.colors.bg }]}>
      <ImageBackground
        source={{ uri: BG_IMAGE }}
        style={styles.img}
        imageStyle={{ resizeMode: 'cover', opacity: 0.11 }}
      >
        <View style={[styles.overlay, { backgroundColor: overlay }]} />
        {children}
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  img: { flex: 1 },
  overlay: { ...StyleSheet.absoluteFillObject },
});
