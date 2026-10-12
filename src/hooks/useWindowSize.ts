import { useEffect, useState } from 'react';

export interface WindowSize {
  width: number;
  height: number;
}

/**
 * Kept in sync with $ksi-max-mobile-width / $ksi-max-small-mobile-width in the SCSS vars
 */
export const SIZE_MOBILE = 900;
export const SIZE_MOBILE_SMALL = 850;

export function useWindowSize(): WindowSize {
  const [size, setSize] = useState<WindowSize>(() => ({
    width: typeof window === 'undefined' ? 1200 : window.innerWidth,
    height: typeof window === 'undefined' ? 800 : window.innerHeight
  }));

  useEffect(() => {
    const onResize = () => setSize({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  return size;
}

export function useIsMobile(): boolean {
  return useWindowSize().width <= SIZE_MOBILE;
}

export function useIsMobileSmall(): boolean {
  return useWindowSize().width <= SIZE_MOBILE_SMALL;
}
