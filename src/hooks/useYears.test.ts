import { sortOrganisators, type Organisator } from './useYears';
import { describe, expect, it } from 'vitest';

function makeUser(id: number, hasPicture: boolean): Organisator {
  return {
    id,
    first_name: 'A',
    last_name: 'B',
    profile_picture: hasPicture ? 'pic.png' : null,
    gender: 'male',
    role: 'org',
    score: 0,
    tasks_num: 0,
    achievements: [],
    enabled: true,
    nick_name: '',
    $hasPicture: hasPicture,
  };
}

describe('sortOrganisators', () => {
  it('puts users with a picture first', () => {
    const users = [makeUser(1, false), makeUser(2, true), makeUser(3, false), makeUser(4, true)];
    const sorted = sortOrganisators(users);
    expect(sorted.slice(0, 2).every((u) => u.$hasPicture)).toBe(true);
    expect(sorted.slice(2).every((u) => !u.$hasPicture)).toBe(true);
  });

  it('is deterministic within one run', () => {
    const users = [makeUser(5, false), makeUser(6, false), makeUser(7, false)];
    expect(sortOrganisators(users).map((u) => u.id)).toEqual(sortOrganisators(users).map((u) => u.id));
  });

  it('does not mutate the input', () => {
    const users = [makeUser(1, false), makeUser(2, true)];
    sortOrganisators(users);
    expect(users[0].id).toBe(1);
  });
});
