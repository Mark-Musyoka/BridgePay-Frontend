'use client';

import { useCallback, useSyncExternalStore } from 'react';
import { THEME_STORAGE_KEY } from './theme-constants';

export type Theme = 'light' | 'dark';

// The source of truth is the data-theme attribute on <html> (set before
// paint by the init script in app/layout.tsx). useSyncExternalStore lets
// React read it safely across server render, hydration, and later
// changes, with no setState-in-effect and no hydration mismatch.
function subscribe(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  return () => observer.disconnect();
}

const getSnapshot = (): Theme =>
  document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';

const getServerSnapshot = (): Theme => 'light';

export function useTheme() {
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const setTheme = useCallback((next: Theme) => {
    document.documentElement.setAttribute('data-theme', next);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {
      // Storage can be blocked (private mode etc.) — the theme still
      // applies for this session, it just won't be remembered.
    }
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(getSnapshot() === 'dark' ? 'light' : 'dark');
  }, [setTheme]);

  return { theme, setTheme, toggleTheme };
}
