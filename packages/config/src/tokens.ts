// POSHA design tokens.
// Main palette: bright red, yellow (dark-mode accent), blue, black, white.
// Chat colors: scoped WhatsApp-inspired palette (only used inside ChatScreen).

export const palette = {
  red:    '#FF0000',
  yellow: '#FFD400',
  blue:   '#0066FF',
  black:  '#000000',
  white:  '#FFFFFF',
} as const;

export const chatColors = {
  bg:           '#E9EDEF', // conversation area background
  bubbleIn:     '#FFFFFF', // incoming bubble
  bubbleOut:    '#D9FDD3', // outgoing bubble
  bubbleText:   '#222222', // text in both bubbles
  meta:         '#718096', // timestamps
  tick:         '#53A5A0', // double-check read
  tickDelivered:'#718096', // single check delivered
} as const;

export type ThemeMode = 'light' | 'dark';

export type Theme = {
  mode: ThemeMode;
  colors: {
    bg: string;
    surface: string;
    surfaceAlt: string;
    text: string;
    textMuted: string;
    textInverse: string;
    primary: string;
    onPrimary: string;
    link: string;
    icon: string;
    border: string;
    divider: string;
    danger: string;
    success: string;
    lockedTile: string;
  };
  chat: typeof chatColors;
  radii: { sm: number; md: number; lg: number; xl: number; pill: number };
  spacing: (n: number) => number;
  fontSizes: { xs: number; sm: number; md: number; lg: number; xl: number; xxl: number; display: number };
  motion: { fast: number; base: number; slow: number };
  palette: typeof palette;
};

const radii = { sm: 8, md: 12, lg: 20, xl: 28, pill: 999 };
const spacing = (n: number) => n * 4;
const fontSizes = { xs: 12, sm: 14, md: 16, lg: 20, xl: 28, xxl: 36, display: 48 };
const motion = { fast: 150, base: 250, slow: 400 };

export const lightTheme: Theme = {
  mode: 'light',
  colors: {
    bg: palette.white,
    surface: palette.white,
    surfaceAlt: palette.white,
    text: palette.black,
    textMuted: palette.black,
    textInverse: palette.white,
    primary: palette.red,
    onPrimary: palette.white,
    link: palette.blue,
    icon: palette.blue,
    border: palette.black,
    divider: palette.black,
    danger: palette.red,
    success: palette.blue,
    lockedTile: palette.black,
  },
  chat: chatColors,
  radii, spacing, fontSizes, motion, palette,
};

export const darkTheme: Theme = {
  mode: 'dark',
  colors: {
    bg: palette.black,
    surface: palette.black,
    surfaceAlt: palette.black,
    text: palette.white,
    textMuted: palette.white,
    textInverse: palette.black,
    primary: palette.yellow,
    onPrimary: palette.black,
    link: palette.blue,
    icon: palette.blue,
    border: palette.white,
    divider: palette.white,
    danger: palette.red,
    success: palette.blue,
    lockedTile: palette.black,
  },
  chat: chatColors,
  radii, spacing, fontSizes, motion, palette,
};

export const themes = { light: lightTheme, dark: darkTheme } as const;
