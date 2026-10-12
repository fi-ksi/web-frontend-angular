import { describe, expect, it, vi } from 'vitest';
import {
  countPositions,
  fixUrl,
  generatePrediction,
  generateProgressBar,
  getFullName,
  getProfilePictureUrl,
  genderKey,
  mergeSimilarWaves,
  translateRole,
  translateSkillLevel,
  type TaskScoreRef
} from './profile-utils';
import type { components } from '../../api/schema';

type S = components['schemas'];

function makeUser(overrides: Partial<S['User']> = {}): S['User'] {
  return {
    id: 1,
    first_name: 'Jan',
    last_name: 'Novák',
    profile_picture: null,
    gender: 'male',
    role: 'participant',
    score: 0,
    tasks_num: 0,
    achievements: [],
    enabled: true,
    nick_name: '',
    ...overrides
  };
}

describe('fixUrl', () => {
  it('collapses duplicated slashes but keeps the protocol', () => {
    expect(fixUrl('http://localhost:3030//img//a.png')).toBe('http://localhost:3030/img/a.png');
  });
});

describe('getProfilePictureUrl', () => {
  it('prefixes a backend-hosted picture with the backend URL', () => {
    const url = getProfilePictureUrl({ profile_picture: '/media/pic.png', gender: 'male' }, false);
    expect(url).toContain('/media/pic.png');
    expect(url).not.toContain('//media');
  });

  it('falls back to default avatars', () => {
    expect(getProfilePictureUrl({ profile_picture: null, gender: 'male' }, false)).toBe(
      '/assets/img/avatar/default.svg'
    );
    expect(getProfilePictureUrl({ profile_picture: null, gender: 'female' }, false)).toBe(
      '/assets/img/avatar/default-woman.svg'
    );
    expect(getProfilePictureUrl({ profile_picture: null, gender: 'male' }, true)).toBe(
      '/assets/img/avatar/org.svg'
    );
  });
});

describe('getFullName', () => {
  it('includes the nick name when present', () => {
    expect(getFullName({ first_name: 'Jan', last_name: 'Novák', nick_name: 'Honza' })).toBe(
      'Jan "Honza" Novák'
    );
  });

  it('omits the nick name when empty', () => {
    expect(getFullName({ first_name: 'Jan', last_name: 'Novák', nick_name: '' })).toBe('Jan Novák');
  });
});

describe('generateProgressBar', () => {
  it('shows a warning bar below the 60% threshold', () => {
    const bars = generateProgressBar(20, 100);
    expect(bars[0].type).toBe('warning');
    expect(bars[0].value).toBe(20);
    expect(bars[1].type).toBe('info');
    expect(bars[1].value).toBe(40);
    // label is on the info bar when the percentage is below 50
    expect(bars[0].label).toBe('');
    expect(bars[1].label).toBe('20%');
  });

  it('shows a success bar at or above the threshold', () => {
    const bars = generateProgressBar(70, 100);
    expect(bars[0].type).toBe('success');
    expect(bars[0].value).toBe(70);
    expect(bars[0].label).toBe('70%');
    expect(bars[1].value).toBe(0);
  });

  it('handles a zero max gracefully', () => {
    const bars = generateProgressBar(0, 0);
    expect(bars[0].value).toBe(0);
    expect(bars[1].value).toBe(60);
  });
});

describe('generatePrediction', () => {
  const task = (id: number, deadline: string, max_score: number) => ({ id, time_deadline: deadline, max_score });

  it('returns null when no scores are visible', () => {
    expect(generatePrediction([task(1, '2020-01-01', 10)], [], 5, 100)).toBeNull();
  });

  it('predicts the needed percentage from the current score', () => {
    const p = generatePrediction([task(1, '2020-01-01', 10)], [{ id: 1, score: 10 }], 30, 100);
    expect(p?.percentFromTotalNeeded).toBe(30);
    expect(p?.doable).toBe(true);
  });

  it('marks the prediction not doable when too many points were missed', () => {
    // task 1 was submitted and scored; task 2 was never submitted and its deadline passed
    const tasks = [task(1, '2020-01-01', 10), task(2, '2020-01-01', 80)];
    const scores: TaskScoreRef[] = [{ id: 1, score: 10 }];
    const p = generatePrediction(tasks, scores, 10, 100);
    // missed 80 points, current 10 -> 80 - 10 = 70 > 40 -> not doable
    expect(p?.doable).toBe(false);
  });

  it('ignores unpublished tasks (scores not yet visible) in the missed score', () => {
    const tasks = [task(1, '2020-01-01', 80)];
    const scores: TaskScoreRef[] = [{ id: 1, score: null }];
    const p = generatePrediction(tasks, scores, 10, 100);
    expect(p?.doable).toBe(true);
  });
});

describe('countPositions', () => {
  it('assigns positions, sharing them between ties', () => {
    const users = [
      makeUser({ id: 1, score: 10 }),
      makeUser({ id: 2, score: 30 }),
      makeUser({ id: 3, score: 30 }),
      makeUser({ id: 4, score: 5 })
    ];
    const positioned = countPositions(users);
    expect(positioned.map((u) => u.id)).toEqual([2, 3, 1, 4]);
    expect(positioned[0].position).toBe('1.-2.');
    expect(positioned[1].position).toBe('1.-2.');
    expect(positioned[2].position).toBe('3.');
    expect(positioned[3].position).toBe('4.');
  });

  it('puts cheaters last', () => {
    const users = [makeUser({ id: 1, score: 5, cheat: true }), makeUser({ id: 2, score: 1 })];
    const positioned = countPositions(users);
    expect(positioned.map((u) => u.id)).toEqual([2, 1]);
  });
});

describe('mergeSimilarWaves', () => {
  const wave = (id: number, caption: string | null, sum_points: number, tasks_cnt: number) => ({
    id,
    caption,
    sum_points,
    tasks_cnt,
    index: 1,
    garant: 1,
    year: 1,
    public: true
  });

  it('merges waves named "X -- Y" into wave X', () => {
    const waves = [wave(1, 'Vlna', 100, 5), wave(2, 'Vlna -- 2', 50, 3), wave(3, 'Jiná', 10, 1)];
    const merged = mergeSimilarWaves(waves);
    expect(merged.map((w) => w.id)).toEqual([1, 3]);
    expect(merged[0].sum_points).toBe(150);
    expect(merged[0].tasks_cnt).toBe(8);
    expect(merged[0].mergedWaveIds).toEqual(new Set([2]));
    expect(merged[1].sum_points).toBe(10);
  });

  it('leaves unrelated waves untouched', () => {
    const waves = [wave(1, 'A', 10, 1), wave(2, 'B', 20, 2)];
    const merged = mergeSimilarWaves(waves);
    expect(merged).toHaveLength(2);
    expect(merged[0].sum_points).toBe(10);
  });
});

describe('translate helpers', () => {
  const t = vi.fn((key: string) => key);

  it('genderKey defaults to male', () => {
    expect(genderKey('female')).toBe('female');
    expect(genderKey('male')).toBe('male');
    expect(genderKey(undefined)).toBe('male');
  });

  it('builds the role key from role and gender', () => {
    expect(translateRole({ role: 'org', gender: 'female' }, t)).toBe('user.role.org.female');
  });

  it('derives the skill level from the number of seasons', () => {
    expect(translateSkillLevel({ seasons: [], gender: 'male' }, t)).toBe('user.skill.none.male');
    expect(translateSkillLevel({ seasons: [1], gender: 'female' }, t)).toBe('user.skill.novice.female');
    expect(translateSkillLevel({ seasons: [1, 2], gender: 'male' }, t)).toBe('user.skill.skilled.male');
    expect(translateSkillLevel({ seasons: [1, 2, 3], gender: 'female' }, t)).toBe('user.skill.master.female');
    expect(translateSkillLevel({ seasons: [1, 2, 3, 4], gender: 'male' }, t)).toBe('user.skill.veteran.male');
  });
});
