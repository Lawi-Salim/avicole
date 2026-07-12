import { useCallback, useEffect, useRef, useState } from 'react';
import { useColorMode } from '@chakra-ui/react';

export const CHAKRA_COLOR_MODE_STORAGE_KEY = 'chakra-ui-color-mode';
export const THEME_MODE_STORAGE_KEY = 'hifadhui-theme-mode';

// Type strict pour le thème
export type ThemeMode = 'light' | 'dark' | 'system';

function getSystemColorMode(): 'light' | 'dark' {
  try {
    if (typeof window === 'undefined' || !window.matchMedia) return 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  } catch {
    return 'dark';
  }
}

export function getStoredThemeMode(): ThemeMode | null {
  try {
    const pref = localStorage.getItem(THEME_MODE_STORAGE_KEY);
    if (pref === 'light' || pref === 'dark' || pref === 'system') return pref;

    const raw = localStorage.getItem(CHAKRA_COLOR_MODE_STORAGE_KEY);
    if (raw === 'light' || raw === 'dark') return raw;
    return null;
  } catch {
    return null;
  }
}

export function setStoredThemeMode(mode: string): void {
  try {
    const m: ThemeMode = mode === 'light' || mode === 'dark' || mode === 'system' ? mode : 'dark';
    localStorage.setItem(THEME_MODE_STORAGE_KEY, m);

    if (m === 'light' || m === 'dark') {
      localStorage.setItem(CHAKRA_COLOR_MODE_STORAGE_KEY, m);
    } else {
      localStorage.removeItem(CHAKRA_COLOR_MODE_STORAGE_KEY);
    }

    // Notify all useThemeMode instances to re-sync
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('hifadhui:theme:change'));
    }
  } catch {
    // ignore
  }
}

export function useThemeMode() {
  const { colorMode, setColorMode } = useColorMode();
  const didInitRef = useRef<boolean>(false);
  const pendingHydrationRef = useRef<string | null>(null);
  const preferenceRef = useRef<ThemeMode>('dark');
  const [themeMode, setThemeModeState] = useState<ThemeMode>('dark');
  const systemListenerRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (didInitRef.current) return;
    didInitRef.current = true;

    const stored = getStoredThemeMode();
    const pref = stored || 'dark';
    preferenceRef.current = pref;
    setThemeModeState(pref);

    const resolved = pref === 'system' ? getSystemColorMode() : pref;
    if (resolved && resolved !== colorMode) {
      pendingHydrationRef.current = resolved;
      setColorMode(resolved);
    }
  }, [colorMode, setColorMode]);

  useEffect(() => {
    if (!didInitRef.current) return;

    // Clear pending hydration once colorMode matches
    const pending = pendingHydrationRef.current;
    if (pending && colorMode === pending) {
      pendingHydrationRef.current = null;
    }
  }, [colorMode]);

  useEffect(() => {
    if (!didInitRef.current) return;

    if (systemListenerRef.current) {
      try {
        systemListenerRef.current();
      } catch {
        // ignore
      }
      systemListenerRef.current = null;
    }

    if (preferenceRef.current !== 'system') return;
    if (typeof window === 'undefined' || !window.matchMedia) return;

    const mql = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => {
      if (preferenceRef.current !== 'system') return;
      const next = mql.matches ? 'dark' : 'light';
      setColorMode(next);
    };

    if (typeof mql.addEventListener === 'function') {
      mql.addEventListener('change', handler);
      systemListenerRef.current = () => mql.removeEventListener('change', handler);
    } else {
      mql.addListener(handler);
      systemListenerRef.current = () => mql.removeListener(handler);
    }

    handler();
  }, [setColorMode, colorMode]);

  // Listen for theme changes from other components/tabs
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleStorageChange = () => {
      const stored = getStoredThemeMode();
      if (stored && stored !== preferenceRef.current) {
        preferenceRef.current = stored;
        setThemeModeState(stored);
        const resolved = stored === 'system' ? getSystemColorMode() : stored;
        setColorMode(resolved);
      }
    };

    window.addEventListener('hifadhui:theme:change', handleStorageChange);
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('hifadhui:theme:change', handleStorageChange);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [setColorMode]);

  const setThemeMode = useCallback((mode: string) => {
    const m: ThemeMode = mode === 'light' || mode === 'dark' || mode === 'system' ? mode : 'dark';
    preferenceRef.current = m;
    setThemeModeState(m);
    setStoredThemeMode(m);

    const resolved = m === 'system' ? getSystemColorMode() : m;
    setColorMode(resolved);
  }, [setColorMode]);

  const toggleThemeMode = useCallback(() => {
    const next = colorMode === 'light' ? 'dark' : 'light';
    preferenceRef.current = next;
    setThemeModeState(next);
    setStoredThemeMode(next);
    setColorMode(next);
  }, [colorMode, setColorMode]);

  return {
    colorMode,
    themeMode,
    setThemeMode,
    toggleThemeMode,
  };
}
