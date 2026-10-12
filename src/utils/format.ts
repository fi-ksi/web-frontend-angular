import type { components } from '../api/schema';

export { formatKsiDate } from './date';

type S = components['schemas'];

/**
 * Minimal translate function accepted by the formatters.
 * Pass the `t` from `useTranslation()`.
 */
export type TranslateFn = (key: string, options?: Record<string, unknown>) => string;

type GenderedUser = Pick<S['User'], 'gender'>;

/**
 * Port of the translateGender pipe: translates `key` for the user's gender,
 * e.g. translateGender(t, 'profile.seasons', user) -> t('profile.seasons.male')
 */
export function translateGender(
  t: TranslateFn,
  key: string,
  user: GenderedUser,
  params?: Record<string, unknown>
): string {
  return `${t(`${key}.${user.gender}`, params)}`;
}

/**
 * Port of the translateNewItems pipe: "5 nových" / "1 nový"
 */
export function translateNewItems(t: TranslateFn, value: number): string {
  const key = 'new.' + (value === 1 ? 'single' : 'multiple');
  return `${value} ${t(key)}`;
}

/**
 * Port of the translatePoints pipe: Czech pluralization of points
 * (1 bod, 2-4 body, 0/5+ bodů, fractional bodu)
 */
export function translatePoints(t: TranslateFn, value: number): string {
  const key =
    'points.' +
    (value === 1 ? 'single' : value % 1 !== 0 ? 'part' : value === 0 || value > 4 ? 'a-lot' : 'a-few');
  return `${value} ${t(key)}`;
}

/**
 * Port of the translateRole pipe: translated user role for the user's gender,
 * e.g. t('user.role.admin.female')
 */
export function translateRole(t: TranslateFn, user: Pick<S['User'], 'role' | 'gender'>): string {
  return `${t(`user.role.${user.role}.${user.gender}`)}`;
}

type SkillUser = Pick<S['User'], 'gender'> & { seasons?: number[] | null };

/**
 * Port of `UserService.isOrg$`: admins count as orgs.
 */
export function isOrg(role: S['UserRole'] | undefined): boolean {
  return role === 'admin' || role === 'org';
}

/**
 * Port of `UserService.isTester$`: orgs (and admins) count as testers.
 */
export function isTester(role: S['UserRole'] | undefined): boolean {
  return isOrg(role) || role === 'tester';
}

/**
 * Port of the translateSkillLevel pipe: skill category derived from the number
 * of seasons the user took part in (none/novice/skilled/master/veteran),
 * translated for the user's gender
 */
export function translateSkillLevel(t: TranslateFn, user: SkillUser): string {
  let skill: string;
  const ksiSeasons = user.seasons?.length || 0;
  if (ksiSeasons <= 0) {
    skill = 'none';
  } else if (ksiSeasons <= 1) {
    skill = 'novice';
  } else if (ksiSeasons <= 2) {
    skill = 'skilled';
  } else if (ksiSeasons <= 3) {
    skill = 'master';
  } else {
    skill = 'veteran';
  }

  return `${t(`user.skill.${skill}.${user.gender}`)}`;
}
