import { translateGender, translateNewItems, translatePoints, translateRole, translateSkillLevel } from './format';
import { describe, expect, it } from 'vitest';

// stub translate: echoes the key so tests assert key selection, not cs.json content
const t = (key: string) => key;

describe('translateGender', () => {
  it('appends the user gender to the key', () => {
    expect(translateGender(t, 'profile.seasons', { gender: 'male' })).toBe('profile.seasons.male');
    expect(translateGender(t, 'profile.seasons', { gender: 'female' })).toBe('profile.seasons.female');
  });
});

describe('translateNewItems', () => {
  it('uses single for 1 and multiple otherwise', () => {
    expect(translateNewItems(t, 1)).toBe('1 new.single');
    expect(translateNewItems(t, 0)).toBe('0 new.multiple');
    expect(translateNewItems(t, 5)).toBe('5 new.multiple');
  });
});

describe('translatePoints', () => {
  it('selects the Czech plural form', () => {
    expect(translatePoints(t, 1)).toBe('1 points.single');
    expect(translatePoints(t, 2)).toBe('2 points.a-few');
    expect(translatePoints(t, 4)).toBe('4 points.a-few');
    expect(translatePoints(t, 0)).toBe('0 points.a-lot');
    expect(translatePoints(t, 5)).toBe('5 points.a-lot');
    expect(translatePoints(t, 2.5)).toBe('2.5 points.part');
  });
});

describe('translateRole', () => {
  it('builds the role key from role and gender', () => {
    expect(translateRole(t, { role: 'admin', gender: 'female' })).toBe('user.role.admin.female');
    expect(translateRole(t, { role: 'participant', gender: 'male' })).toBe('user.role.participant.male');
  });
});

describe('translateSkillLevel', () => {
  const cases: Array<[number[] | undefined, string]> = [
    [undefined, 'user.skill.none.male'],
    [[], 'user.skill.none.male'],
    [[2024], 'user.skill.novice.male'],
    [[2023, 2024], 'user.skill.skilled.female'],
    [[2022, 2023, 2024], 'user.skill.master.male'],
    [[2021, 2022, 2023, 2024], 'user.skill.veteran.female'],
  ];
  it.each(cases)('seasons %s -> %s', (seasons, expected) => {
    const gender = expected.endsWith('.female') ? 'female' : 'male';
    expect(translateSkillLevel(t, { gender, seasons })).toBe(expected);
  });
});
