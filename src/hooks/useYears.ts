import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSyncExternalStore } from 'react';
import {
  achievementsGetAll,
  adminTasksGetAll,
  articlesGetAll,
  threadsGetAll,
  usersGetAll,
  yearsGetAll,
} from '../api/client';
import type { components } from '../api/schema';
import { storageDelete, storageGet, storageSet } from '../utils/storage';
import { getProfilePictureUrl, parseLegacyAssetsUrl, substrHTML } from '../utils/utils';
import type { IYear, YearSelect } from '../types';

type S = components['schemas'];

const STORAGE_SCOPE = 'years';
const STORAGE_KEY = 'selected';

/* ------------------------------------------------------------------ */
/* Selected-year store (port of YearsService.selected)                 */
/* A tiny external store so no provider wiring is needed; persisted    */
/* in scoped localStorage exactly like the Angular service.            */
/* ------------------------------------------------------------------ */

let selected: YearSelect | null | undefined;

function ensureLoaded(): void {
  if (selected === undefined && typeof window !== 'undefined') {
    selected = storageGet<YearSelect>(STORAGE_SCOPE, STORAGE_KEY, null);
  }
}

const listeners = new Set<() => void>();

function notify(): void {
  listeners.forEach((l) => l());
}

function subscribe(fn: () => void): () => void {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

function getSnapshot(): YearSelect | null {
  ensureLoaded();
  return selected ?? null;
}

/**
 * Sets the selected year (persists to storage). Pass null to clear.
 */
export function setSelectedYear(value: YearSelect | null): void {
  ensureLoaded();
  selected = value;
  if (typeof window !== 'undefined') {
    if (value) {
      storageSet(STORAGE_SCOPE, STORAGE_KEY, value);
    } else {
      storageDelete(STORAGE_SCOPE, STORAGE_KEY);
    }
  }
  notify();
}

/**
 * Currently selected year (null when nothing is selected yet)
 */
export function useSelectedYear(): YearSelect | null {
  return useSyncExternalStore(subscribe, getSnapshot, () => null);
}

function toYearSelect(year: IYear): YearSelect {
  return { year: year.year, id: year.id, $newest: year.$newest };
}

/* ------------------------------------------------------------------ */
/* All years (port of YearsService.all$)                               */
/* Sorted by id descending, newest flagged with $newest. Auto-selects  */
/* the newest year when none is selected, and switches to a newly      */
/* published year when the saved selection was the newest one.         */
/* ------------------------------------------------------------------ */

export function useYears() {
  const query = useQuery({
    queryKey: ['years'],
    queryFn: async (): Promise<IYear[]> => {
      const resp = await yearsGetAll();
      return [...resp.years]
        .sort((a, b) => b.id - a.id)
        .map((year, index) => ({ ...year, $newest: index === 0 }));
    },
    staleTime: Infinity,
  });

  const years = query.data;

  useEffect(() => {
    if (!years || years.length === 0) {
      return;
    }
    const current = getSnapshot();
    if (!current) {
      setSelectedYear(toYearSelect(years[0]));
      return;
    }
    if (current.$newest && years[0].id !== current.id) {
      // a new year was published since the selection was saved
      setSelectedYear(toYearSelect(years[0]));
      return;
    }
    // refresh the stored selection with the newest year data (e.g. after a point-pad change)
    const fresh = years.find((y) => y.id === current.id);
    if (fresh && (fresh.year !== current.year || fresh.$newest !== current.$newest)) {
      setSelectedYear(toYearSelect(fresh));
    }
  }, [years]);

  return query;
}

/**
 * Full data of the selected year (port of YearsService.selectedFull$)
 */
export function useSelectedFullYear(): IYear | null | undefined {
  const selectedYear = useSelectedYear();
  const { data: years } = useYears();
  if (!years) {
    return undefined;
  }
  if (!selectedYear) {
    return null;
  }
  return years.find((y) => y.id === selectedYear.id) ?? null;
}

/**
 * Year id to query with: the selected year, or undefined while nothing is selected
 */
export function useSelectedYearId(): number | undefined {
  return useSelectedYear()?.id;
}

/* ------------------------------------------------------------------ */
/* Per-year data (ports of the YearsService observables)               */
/* ------------------------------------------------------------------ */

export type ArticlePreview = S['Article'] & {
  picture: string;
  body: string;
};

/**
 * Latest articles of the selected year with HTML stripped to a 512-char preview
 * (port of YearsService.articles$)
 */
export function useYearArticles() {
  const yearId = useSelectedYearId();
  return useQuery({
    queryKey: ['articles', yearId],
    queryFn: async (): Promise<ArticlePreview[]> => {
      const resp = await articlesGetAll(30, 0, undefined, yearId);
      return (resp.articles || []).map((article) => ({
        ...article,
        picture: parseLegacyAssetsUrl(article.picture),
        body: substrHTML(article.body, 0, 512),
      }));
    },
  });
}

export type Organisator = S['User'] & { $hasPicture: boolean };

/**
 * Daily-shuffled organisator ordering from YearsService.organisators$
 */
export function sortOrganisators(users: Organisator[]): Organisator[] {
  return [...users].sort((a, b) => {
    if (a.$hasPicture && !b.$hasPicture) {
      return -1;
    }
    if (!a.$hasPicture && b.$hasPicture) {
      return 1;
    }

    const now = new Date();

    const dayA = (now.getMonth() + a.id) ** 2 % now.getDay();
    const dayB = (now.getMonth() + b.id) ** 2 % now.getDay();

    if (dayA !== dayB) {
      return dayA < dayB ? -1 : 1;
    }

    const reverse = now.getDate() % 2 === 1;

    if (a.id > b.id) {
      return reverse ? -1 : 1;
    } else {
      return reverse ? 1 : -1;
    }
  });
}

/**
 * Organisators of the selected year, picture first, then daily-shuffled
 * (port of YearsService.organisators$)
 */
export function useYearOrganisators() {
  const yearId = useSelectedYearId();
  return useQuery({
    queryKey: ['organisators', yearId],
    queryFn: async (): Promise<Organisator[]> => {
      const resp = await usersGetAll('organisators', 'score', yearId);
      const users: Organisator[] = resp.users.map((user) => ({
        ...user,
        $hasPicture: !!user.profile_picture,
        profile_picture: getProfilePictureUrl(user, true),
      }));
      return sortOrganisators(users);
    },
  });
}

/**
 * High-school participants of the selected year, sorted by score
 * (port of YearsService.usersHighSchool$)
 */
export function useYearUsersHighSchool() {
  const yearId = useSelectedYearId();
  return useQuery({
    queryKey: ['users', 'part-hs', yearId],
    queryFn: async (): Promise<S['User'][]> => {
      const resp = await usersGetAll('part-hs', 'score', yearId);
      return resp.users;
    },
  });
}

/**
 * Non-high-school participants of the selected year, sorted by score
 * (port of YearsService.usersOther$)
 */
export function useYearUsersOther() {
  const yearId = useSelectedYearId();
  return useQuery({
    queryKey: ['users', 'part-other', yearId],
    queryFn: async (): Promise<S['User'][]> => {
      const resp = await usersGetAll('part-other', 'score', yearId);
      return resp.users;
    },
  });
}

/**
 * Discussion threads of the selected year (port of YearsService.discussionThreads$)
 */
export function useYearThreads() {
  const yearId = useSelectedYearId();
  return useQuery({
    queryKey: ['threads', yearId],
    queryFn: async (): Promise<S['Thread'][]> => {
      const resp = await threadsGetAll(undefined, yearId);
      return resp.threads;
    },
  });
}

/**
 * Admin tasks of the selected year (port of YearsService.adminTasks$)
 */
export function useYearAdminTasks() {
  const yearId = useSelectedYearId();
  return useQuery({
    queryKey: ['adminTasks', yearId],
    queryFn: async (): Promise<S['AdminTask'][]> => {
      const resp = await adminTasksGetAll(undefined, yearId);
      return resp.atasks;
    },
  });
}

/**
 * Achievements of the selected year (port of YearsService.achievements$)
 */
export function useYearAchievements() {
  const yearId = useSelectedYearId();
  return useQuery({
    queryKey: ['achievements', yearId],
    queryFn: async (): Promise<S['Achievement'][]> => {
      const resp = await achievementsGetAll(undefined, undefined, undefined, yearId);
      return resp.achievements;
    },
  });
}
