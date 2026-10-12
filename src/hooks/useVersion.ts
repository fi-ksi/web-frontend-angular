import { useQuery } from '@tanstack/react-query';
import type { Changelog } from '../types';

/**
 * Port of VersionService: version string and changelog served as static assets.
 */
export function useAppVersion() {
  return useQuery({
    queryKey: ['version'],
    queryFn: async (): Promise<string> => {
      const resp = await fetch('/assets/changelog/version.txt');
      if (!resp.ok) {
        throw new Error(`HTTP ${resp.status} /assets/changelog/version.txt`);
      }
      return (await resp.text()).trim();
    },
    staleTime: Infinity,
  });
}

export function useChangelog() {
  return useQuery({
    queryKey: ['changelog'],
    queryFn: async (): Promise<Changelog> => {
      const resp = await fetch('/assets/changelog/changelog.json');
      if (!resp.ok) {
        throw new Error(`HTTP ${resp.status} /assets/changelog/changelog.json`);
      }
      return (await resp.json()) as Changelog;
    },
    staleTime: Infinity,
  });
}
