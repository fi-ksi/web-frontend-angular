import { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { usersGetAll, usersGetSingle } from '../api/client';
import type { components } from '../api/schema';
import { useAuth } from '../auth/AuthContext';
import { fullName, getProfilePictureUrl } from '../utils/utils';
import type { IUser, YearSelect } from '../types';
import { useSelectedYear } from './useYears';

type S = components['schemas'];

export type UserWithPicture = S['User'] & {
  profile_picture: string;
};

/**
 * Cached single-user lookup. react-query's cache replaces the Angular
 * UsersCacheService shareReplay cache.
 */
export function useUser(userId: number | undefined): {
  user: UserWithPicture | null;
  isLoading: boolean;
} {
  const userQuery = useQuery({
    queryKey: ['user', userId],
    queryFn: async (): Promise<UserWithPicture> => {
      const resp = await usersGetSingle(userId!);
      return { ...resp.user, profile_picture: getProfilePictureUrl(resp.user, false) };
    },
    enabled: userId !== undefined,
    staleTime: 5 * 60_000
  });
  return { user: userQuery.data ?? null, isLoading: userQuery.isLoading };
}

/**
 * Port of UsersCacheService.getProfilePicture (static).
 * Returns the backend URL of the profile picture, or a default/org avatar.
 */
export function getProfilePicture(
  user: Pick<S['User'], 'profile_picture' | 'gender'>,
  isOrg: boolean
): string {
  return getProfilePictureUrl(user, isOrg);
}

/**
 * Port of UsersCacheService.getIUser: enriches a raw user with computed fields
 */
export function toIUser(user: S['User'], year: YearSelect | null): IUser {
  const isAdmin = user.role === 'admin';
  const isOrg = isAdmin || user.role === 'org';

  return {
    ...user,
    $isAdmin: isAdmin,
    $isOrg: isOrg,
    $year: year,
    $fullName: fullName(user),
    $hasPicture: !!user.profile_picture,
    profile_picture: getProfilePicture(user, isOrg),
  };
}

/**
 * Year-aware enriched user (full port of UsersCacheService.getUser).
 * The query key contains the selected year, so the user is refetched whenever
 * the year changes — mirroring the Angular year-mismatch refresh. The cache
 * is invalidated on login change, like the Angular cache flush.
 */
export function useEnrichedUser(userId: number | null | undefined) {
  const year = useSelectedYear();
  const { isLoggedIn } = useAuth();
  const queryClient = useQueryClient();

  useEffect(() => {
    void queryClient.invalidateQueries({ queryKey: ['user'] });
  }, [isLoggedIn, queryClient]);

  return useQuery({
    queryKey: ['user', userId, year?.id ?? null],
    queryFn: async (): Promise<IUser> => {
      const resp = await usersGetSingle(userId as number, year?.id);
      return toIUser(resp.user, year);
    },
    enabled: userId !== null && userId !== undefined,
  });
}

/**
 * Cached user list (port of AdminUsersService.getUsers and the shareReplay(1)
 * caching used by the admin exec user typeahead). Components call the typed
 * api client directly for everything else.
 */
export function useUsersAll(filter?: string, sort?: string, yearId?: number) {
  return useQuery({
    queryKey: ['users', 'all', filter ?? null, sort ?? null, yearId ?? null],
    queryFn: async (): Promise<S['User'][]> => {
      const resp = await usersGetAll(filter, sort, yearId);
      return resp.users;
    },
    staleTime: 60_000,
  });
}
