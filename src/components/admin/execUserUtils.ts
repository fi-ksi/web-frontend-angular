import type { components } from '../../api/schema';

type S = components['schemas'];

/**
 * Display string for a user in the exec page typeahead:
 * "123 - Jan Novak". The typeahead search matches against this (substring),
 * and resolveUserId accepts it as an exact match when typed by hand.
 */
export function userFormatter(user: S['User']): string {
  return `${user.id} - ${user.first_name} ${user.last_name}`;
}

/**
 * Resolves the user form field value to a user id.
 *
 * The typeahead stores a User object only when an item is picked from the
 * dropdown; plain typed text is resolved against the loaded users list
 * (exact "id - first_name last_name" or e-mail match). Returns null when
 * the text is empty or does not identify exactly one user.
 */
export function resolveUserId(
  value: S['User'] | string | null | undefined,
  users: S['User'][]
): number | null {
  if (value !== null && typeof value === 'object' && typeof value.id === 'number') {
    return value.id;
  }
  if (typeof value === 'string') {
    const term = value.trim().toLowerCase();
    if (term) {
      const matches = users.filter(
        (user) =>
          userFormatter(user).toLowerCase() === term ||
          (user.email != null && user.email.toLowerCase() === term)
      );
      if (matches.length === 1) {
        return matches[0].id;
      }
    }
  }
  return null;
}
