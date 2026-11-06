// POSHA design tokens - Monochromatic Red Design System
// Only 5 permitted colours: #FF0000, #FF4D4D, #808080, #000000, #FFFFFF

export const palette = {
  white: '#FFFFFF',
  black: '#000000',
} as const;

export type ThemeMode = 'light' | 'dark';

export type ChatThemeColors = {
  bg: string;
  bubbleIn: string;
  bubbleOut: string;
  bubbleText: string;
  meta: string;
  tick: string;
  tickDelivered: string;
};

export type ThemeColors = {
  bg: string;
  surface: string;
  surfaceAlt: string;
  text: string;
  textMuted: string;
  border: string;
  divider: string;
  primary: string;
  primaryPressed: string;
  onPrimary: string;
  primaryText: string;
  accent: string;
  accentSoft: string;
  danger: string;
  icon: string;
  iconActive: string;
  scrim: string;
  onMedia: string;
};

export type Theme = {
  mode: ThemeMode;
  colors: ThemeColors;
  chat: ChatThemeColors;
  radii: { sm: number; md: number; lg: number; xl: number; pill: number };
  spacing: (n: number) => number;
  fontSizes: { xs: number; sm: number; md: number; lg: number; xl: number; xxl: number; display: number };
  motion: { fast: number; base: number; slow: number };
  palette: typeof palette;
};

const radii = { sm: 8, md: 12, lg: 12, xl: 16, pill: 999 };
const spacing = (n: number) => n * 4;
const fontSizes = { xs: 11, sm: 13, md: 17, xl: 20, xxl: 24, display: 28 };
const motion = { fast: 150, base: 250, slow: 400 };

export const lightTheme: Theme = {
  mode: 'light',
  colors: {
    bg: '#FFFFFF',
    surface: '#FFFFFF',
    surfaceAlt: '#808080',
    text: '#000000',
    textMuted: '#808080',
    border: '#808080',
    divider: '#808080',
    primary: '#FF0000',
    primaryPressed: '#FF4D4D',
    onPrimary: '#FFFFFF',
    primaryText: '#FF0000',
    accent: '#FF4D4D',
    accentSoft: '#FFFFFF',
    danger: '#FF4D4D',
    icon: '#808080',
    iconActive: '#FF0000',
    scrim: '#000000',
    onMedia: '#FFFFFF',
  },
  chat: {
    bg: '#FFFFFF',
    bubbleIn: '#FFFFFF',
    bubbleOut: '#FFE3E8',
    bubbleText: '#000000',
    meta: '#808080',
    tick: '#FF0000',
    tickDelivered: '#808080',
  },
  radii,
  spacing,
  fontSizes,
  motion,
  palette,
};

export const darkTheme: Theme = {
  mode: 'dark',
  colors: {
    bg: '#000000',
    surface: '#000000',
    surfaceAlt: '#808080',
    text: '#FFFFFF',
    textMuted: '#808080',
    border: '#808080',
    divider: '#808080',
    primary: '#FF0000',
    primaryPressed: '#FF4D4D',
    onPrimary: '#FFFFFF',
    primaryText: '#FF4D4D',
    accent: '#FF4D4D',
    accentSoft: '#000000',
    danger: '#FF4D4D',
    icon: '#808080',
    iconActive: '#FF0000',
    scrim: '#000000',
    onMedia: '#FFFFFF',
  },
  chat: {
    bg: '#000000',
    bubbleIn: '#000000',
    bubbleOut: '#3A1B24',
    bubbleText: '#FFFFFF',
    meta: '#808080',
    tick: '#FF4D4D',
    tickDelivered: '#808080',
  },
  radii,
  spacing,
  fontSizes,
  motion,
  palette,
};

export const themes = { light: lightTheme, dark: darkTheme } as const;