import { useQuery } from '@tanstack/react-query';
import { articlesGetAll, usersGetAll } from '../api/client';
import type { components } from '../api/schema';
import { useYear } from './useYear';
import { getProfilePictureUrl, parseLegacyAssetsUrl, substrHTML } from '../utils/utils';

type S = components['schemas'];

export type Organisator = S['User'] & {
  $hasPicture: boolean;
  profile_picture: string;
};

/**
 * Articles of the currently selected year, with legacy picture URLs fixed
 * and bodies truncated to a 512-character plain-text preview.
 */
export function useArticles(): { articles: S['Article'][]; isLoading: boolean } {
  const { selected } = useYear();
  const yearId = selected?.id;
  const articlesQuery = useQuery({
    queryKey: ['articles', yearId],
    queryFn: async (): Promise<S['Article'][]> => {
      const resp = await articlesGetAll(30, 0, undefined, yearId);
      return resp.articles.map((article) => ({
        ...article,
        picture: parseLegacyAssetsUrl(article.picture),
        body: substrHTML(article.body, 0, 512)
      }));
    },
    enabled: yearId !== undefined,
    staleTime: 60_000
  });
  return { articles: articlesQuery.data ?? [], isLoading: articlesQuery.isLoading };
}

/**
 * Organisators of the currently selected year, organisers with a profile
 * picture first.
 */
export function useOrganisators(): { organisators: Organisator[]; isLoading: boolean } {
  const { selected } = useYear();
  const yearId = selected?.id;
  const orgsQuery = useQuery({
    queryKey: ['organisators', yearId],
    queryFn: async (): Promise<Organisator[]> => {
      const resp = await usersGetAll('organisators', 'score', yearId);
      return resp.users
        .map((user) => ({
          ...user,
          $hasPicture: !!user.profile_picture,
          profile_picture: getProfilePictureUrl(user, true)
        }))
        .sort((a, b) => {
          if (a.$hasPicture && !b.$hasPicture) return -1;
          if (!a.$hasPicture && b.$hasPicture) return 1;
          return a.id - b.id;
        });
    },
    enabled: yearId !== undefined,
    staleTime: 60_000
  });
  return { organisators: orgsQuery.data ?? [], isLoading: orgsQuery.isLoading };
}
