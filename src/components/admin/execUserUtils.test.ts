import { describe, expect, it } from 'vitest';
import { resolveUserId, userFormatter } from './execUserUtils';
import type { components } from '../../api/schema';

type S = components['schemas'];

const user = (overrides: Partial<S['User']>): S['User'] => ({
  id: 1,
  first_name: 'Jan',
  last_name: 'Novak',
  profile_picture: null,
  gender: 'male',
  role: 'participant',
  score: 0,
  tasks_num: 0,
  achievements: [],
  enabled: true,
  nick_name: 'jano',
  ...overrides
});

const USERS: S['User'][] = [
  user({ id: 7, first_name: 'Ada', last_name: 'Lovelace', email: 'ada@example.com' }),
  user({ id: 42, first_name: 'Alan', last_name: 'Turing', email: 'alan@example.com' })
];

describe('userFormatter', () => {
  it('formats as "id - first_name last_name"', () => {
    expect(userFormatter(USERS[0])).toBe('7 - Ada Lovelace');
  });
});

describe('resolveUserId', () => {
  it('returns the id when the value is a User object', () => {
    expect(resolveUserId(USERS[1], USERS)).toBe(42);
  });

  it('resolves an exact "id - name" string match', () => {
    expect(resolveUserId('7 - Ada Lovelace', USERS)).toBe(7);
  });

  it('is case-insensitive and trims whitespace', () => {
    expect(resolveUserId('  42 - ALAN TURING  ', USERS)).toBe(42);
  });

  it('resolves an exact e-mail match', () => {
    expect(resolveUserId('alan@example.com', USERS)).toBe(42);
  });

  it('returns null for text that matches nobody', () => {
    expect(resolveUserId('nobody here', USERS)).toBeNull();
  });

  it('returns null for a mere prefix (typed but not picked)', () => {
    expect(resolveUserId('Ada', USERS)).toBeNull();
  });

  it('returns null for empty or whitespace-only text', () => {
    expect(resolveUserId('', USERS)).toBeNull();
    expect(resolveUserId('   ', USERS)).toBeNull();
  });

  it('returns null for null/undefined', () => {
    expect(resolveUserId(null, USERS)).toBeNull();
    expect(resolveUserId(undefined, USERS)).toBeNull();
  });

  it('returns null when multiple users match the term', () => {
    const dupes: S['User'][] = [
      user({ id: 1, first_name: 'Jan', last_name: 'Novak', email: 'same@example.com' }),
      user({ id: 2, first_name: 'Jana', last_name: 'Novakova', email: 'SAME@example.com' })
    ];
    expect(resolveUserId('same@example.com', dupes)).toBeNull();
  });
});
