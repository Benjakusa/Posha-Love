import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';

type AvatarProps = {
  uri?: string | null;
  name?: string;
  size?: 24 | 32 | 40 | 56 | 96 | number;
};

export function Avatar({ uri, name = '', size = 40 }: AvatarProps) {
  const { theme } = useTheme();
  const initials = name.replace(/[^A-Za-z0-9]/g, '').slice(0, 2).toUpperCase() || 'P';
  const fontSize = Math.max(10, Math.round(size * 0.38));

  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: theme.colors.accentSoft,
        overflow: 'hidden',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {uri ? (
        <Image source={{ uri }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
      ) : (
        <Text style={{ color: theme.colors.primaryText, fontSize, fontWeight: '600' }}>
          {initials}
        </Text>
      )}
    </View>
  );
}

type LiveRingProps = {
  uri?: string | null;
  name?: string;
  size?: number; // default 56
  isLive?: boolean;
  isScheduled?: boolean;
};

export function LiveRing({ uri, name, size = 56, isLive = true, isScheduled = false }: LiveRingProps) {
  const { theme } = useTheme();
  const ringSize = size + 9;
  const strokeWidth = 2.5;

  return (
    <View style={{ width: ringSize, height: ringSize + (isLive ? 6 : 0), alignItems: 'center', justifyContent: 'center' }}>
      {isLive ? (
        <View style={{ width: ringSize, height: ringSize, borderRadius: ringSize / 2, backgroundColor: theme.colors.primary, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ color: theme.colors.onPrimary, fontSize: 12, fontWeight: '700' }}>LIVE</Text>
        </View>
      ) : isScheduled ? (
        <Svg width={ringSize} height={ringSize} style={StyleSheet.absoluteFill}>
          <Circle
            cx={ringSize / 2}
            cy={ringSize / 2}
            r={(ringSize - strokeWidth) / 2}
            stroke={theme.colors.border}
            strokeWidth={1.5}
            strokeDasharray="4 3"
            fill="none"
          />
        </Svg>
      ) : null}

      {/* 2px bg gap around avatar */}
      <View
        style={{
          width: size + 4,
          height: size + 4,
          borderRadius: (size + 4) / 2,
          backgroundColor: theme.colors.bg,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Avatar uri={uri} name={name} size={size} />
      </View>

      {/* LIVE pill at bottom centre */}
      {isLive ? (
        <View
          style={{
            position: 'absolute',
            bottom: 0,
            backgroundColor: theme.colors.primary,
            paddingHorizontal: 6,
            paddingVertical: 2,
            borderRadius: theme.radii.pill,
          }}
        >
          <Text style={{ color: theme.colors.onPrimary, fontSize: 10, fontWeight: '700', lineHeight: 12 }}>
            LIVE
          </Text>
        </View>
      ) : null>
    </View>
  );
}
