import React from 'react';
import { Text, type TextProps } from 'react-native';
import Svg, { Path, Rect, Circle } from 'react-native-svg';
import { palette } from '@posha/config';

type IconProps = { size?: number; color?: string } & Omit<TextProps, 'style'>;

function Glyph({ children, size = 22, color = '#0066FF', ...rest }: IconProps & { children: string }) {
  return (
    <Text
      style={{ fontSize: size, color, lineHeight: size + 2, textAlign: 'center' }}
      accessibilityRole="image"
      {...rest}
    >
      {children}
    </Text>
  );
}

function Padlock({ size = 22, color = '#0066FF' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x="5" y="11" width="14" height="10" rx="2" fill={color} />
      <Path d="M8 11V7a4 4 0 118 0v4" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function Unlock({ size = 22, color = '#0066FF' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x="5" y="11" width="14" height="10" rx="2" fill={color} />
      <Path d="M8 11V7a4 4 0 017-2.65" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function TrashIcon({ size = 22, color = '#0066FF' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M3 6h18" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <Path d="M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M10 11v6M14 11v6" stroke={color} strokeWidth="2" strokeLinecap="round" />
    </Svg>
  );
}

export const Icon = {
  Settings: (p: IconProps) => <Glyph {...p}>⚙</Glyph>,
  User:     (p: IconProps) => <Glyph {...p}>◉</Glyph>,
  Sun:      (p: IconProps) => <Glyph {...p}>☀</Glyph>,
  Moon:     (p: IconProps) => <Glyph {...p}>☾</Glyph>,
  Chat:     (p: IconProps) => <Glyph {...p}>◌</Glyph>,
  Video:    (p: IconProps) => <Glyph {...p}>▷</Glyph>,
  Lock:     (p: IconProps) => <Padlock {...p} />,
  Unlock:   (p: IconProps) => <Unlock {...p} />,
  Trash:    (p: IconProps) => <TrashIcon {...p} />,
  Heart:    (p: IconProps) => <Glyph {...p}>♥</Glyph>,
  Play:     (p: IconProps) => <Glyph {...p}>▶</Glyph>,
  Calendar: (p: IconProps) => <Glyph {...p}>▤</Glyph>,
  Close:    (p: IconProps) => <Glyph {...p}>✕</Glyph>,
  Back:     (p: IconProps) => <Glyph {...p}>←</Glyph>,
  Check:    (p: IconProps) => <Glyph {...p}>✓</Glyph>,
  Next:     (p: IconProps) => <Glyph {...p}>→</Glyph>,
  Bell:     (p: IconProps) => <Glyph {...p}>◔</Glyph>,
  Home:     (p: IconProps) => <Glyph {...p}>⌂</Glyph>,
  Explore:  (p: IconProps) => <Glyph {...p}>◇</Glyph>,
  Filter:   (p: IconProps) => <Glyph {...p}>≡</Glyph>,
  Warning:  (p: IconProps) => <Glyph {...p}>⚠</Glyph>,
};
