import React, { createContext, useContext, useEffect, useState } from 'react';
import { useColorScheme } from 'react-native';
import { themes, type Theme, type ThemeMode } from '@posha/config';

type Ctx = {
  theme: Theme;
  mode: ThemeMode;
  setMode: (m: ThemeMode) => void;
  toggle: () => void;
};

const ThemeCtx = createContext<Ctx | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const system = useColorScheme();
  const [mode, setMode] = useState<ThemeMode>('light');
  const [pinned, setPinned] = useState(false);

  const value: Ctx = {
    theme: themes[mode],
    mode,
    setMode: (m) => { setPinned(true); setMode(m); },
    toggle: () => { setPinned(true); setMode((m) => (m === 'dark' ? 'light' : 'dark')); },
  };
  return <ThemeCtx.Provider value={value}>{children}</ThemeCtx.Provider>;
}

export function useTheme(): Ctx {
  const ctx = useContext(ThemeCtx);
  if (!ctx) throw new Error('useTheme must be used inside ThemeProvider');
  return ctx;
}
