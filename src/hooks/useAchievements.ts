import { useQuery } from '@tanstack/react-query';
import { achievementsGetAll, achievementsGetSingle, achievementsGetSuccessful } from '../api/client';
import type { components } from '../api/schema';
import { useSelectedYearId } from './useYears';

type S = components['schemas'];

/**
 * Cached single achievement (port of AchievementService.getAchievement)
 */
export function useAchievement(achievementId: number | null | undefined) {
  return useQuery({
    queryKey: ['achievement', achievementId],
    queryFn: async (): Promise<S['Achievement']> => {
      const resp = await achievementsGetSingle(achievementId as number);
      return resp.achievement;
    },
    enabled: achievementId !== null && achievementId !== undefined,
    staleTime: Infinity,
  });
}

/**
 * The special "successful" achievement (port of AchievementService.getSpecialAchievement)
 */
export function useSuccessfulAchievement() {
  return useQuery({
    queryKey: ['achievement', 'successful'],
    queryFn: async (): Promise<S['Achievement']> => {
      const idResp = await achievementsGetSuccessful();
      const resp = await achievementsGetSingle(idResp.achievement.id);
      return resp.achievement;
    },
    staleTime: Infinity,
  });
}

/**
 * Achievements of a year (port of AchievementService.getAll).
 * Defaults to the selected year.
 */
export function useAchievements(yearId?: number) {
  const selectedYearId = useSelectedYearId();
  const year = yearId ?? selectedYearId;
  return useQuery({
    queryKey: ['achievements', 'list', year ?? null],
    queryFn: async (): Promise<S['Achievement'][]> => {
      const resp = await achievementsGetAll(20, 0, undefined, year);
      return resp.achievements;
    },
  });
}
