import { useCallback, useEffect, useState } from 'react';
import { storageGet, storageSet } from '../utils/storage';

export type Theme = 'light' | 'dark';

const BROADCAST_CHANNEL = 'ksi-theme';

function applyThemeClass(theme: Theme): void {
  const { classList } = document.body;
  Array.from(classList)
    .filter((cls) => cls.startsWith('theme-'))
    .forEach((cls) => classList.remove(cls));
  classList.add(`theme-${theme}`);
}

export function useTheme(): { theme: Theme; toggleTheme: () => void; setTheme: (theme: Theme) => void } {
  const [theme, setThemeState] = useState<Theme>(() => storageGet<Theme>('theme', 'selected') ?? 'light');

  useEffect(() => {
    applyThemeClass(theme);
  }, [theme]);

  useEffect(() => {
    const channel = new BroadcastChannel(BROADCAST_CHANNEL);
    channel.onmessage = (message: MessageEvent<Theme>) => setThemeState(message.data);
    return () => channel.close();
  }, []);

  const setTheme = useCallback((next: Theme) => {
    setThemeState(next);
    applyThemeClass(next);
    storageSet('theme', 'selected', next);
    new BroadcastChannel(BROADCAST_CHANNEL).postMessage(next);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  }, [theme, setTheme]);

  return { theme, toggleTheme, setTheme };
}
