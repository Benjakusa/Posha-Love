// Strict 4-color icon set — blue only. Simple glyphs, no SVG dependency.
import React from 'react';
import { Text, type TextProps } from 'react-native';
import { palette } from '@posha/config';

type IconProps = { size?: number; color?: string } & Omit<TextProps, 'style'>;

function Glyph({ children, size = 22, color = palette.blue, ...rest }: IconProps & { children: string }) {
  return (
    <Text style={{ fontSize: size, color, lineHeight: size + 2, textAlign: 'center' }} accessibilityRole="image" {...rest}>
      {children}
    </Text>
  );
}

export const Icon = {
  Settings: (p: IconProps) => <Glyph {...p}>⚙</Glyph>,
  User:     (p: IconProps) => <Glyph {...p}>◉</Glyph>,
  Sun:      (p: IconProps) => <Glyph {...p}>☀</Glyph>,
  Moon:     (p: IconProps) => <Glyph {...p}>☾</Glyph>,
  Chat:     (p: IconProps) => <Glyph {...p}>◌</Glyph>,
  Video:    (p: IconProps) => <Glyph {...p}>▷</Glyph>,
  Lock:     (p: IconProps) => <Glyph {...p}>▣</Glyph>,
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
};
