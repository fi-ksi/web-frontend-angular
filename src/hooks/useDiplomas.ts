import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { adminDiplomaGrantForm, diplomasListForUserSingle } from '../api/client';
import type { components } from '../api/schema';
import { useSelectedYearId } from './useYears';

type S = components['schemas'];

export interface UserDiploma {
  hasDiploma: boolean;
  url?: string;
}

/**
 * All diplomas of a user (port of DiplomasService.cache)
 */
export function useUserDiplomas(userId: number | null | undefined) {
  return useQuery({
    queryKey: ['diplomas', userId],
    queryFn: async (): Promise<S['DiplomasList'][]> => {
      const resp = await diplomasListForUserSingle(userId as number);
      return resp.diplomas;
    },
    enabled: userId !== null && userId !== undefined,
  });
}

/**
 * Whether the user has a diploma for the selected year, and its URL
 * (port of DiplomasService.userHasDiploma / userDiplomaURL)
 */
export function useUserDiploma(userId: number | null | undefined): UserDiploma & { isLoading: boolean } {
  const yearId = useSelectedYearId();
  const { data: diplomas, isLoading } = useUserDiplomas(userId);
  const diploma = diplomas?.find((d) => d.year === yearId);
  return { hasDiploma: diploma !== undefined, url: diploma?.url, isLoading };
}

/**
 * Grants a diploma to a user and refreshes the diploma cache
 * (port of DiplomasService.uploadDiploma)
 */
export function useGrantDiploma() {
  const queryClient = useQueryClient();
  const yearId = useSelectedYearId();
  return useMutation({
    mutationFn: ({ userId, file }: { userId: number; file: File }) =>
      adminDiplomaGrantForm(file, userId, yearId),
    onSuccess: (_data, { userId }) => {
      void queryClient.invalidateQueries({ queryKey: ['diplomas', userId] });
    },
  });
}
