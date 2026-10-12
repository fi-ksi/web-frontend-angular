import type { components } from '../api/schema';
import type { TaskWithIcon, WaveDetails } from '../types';
import { addTaskIcon, getTaskLevel, mergeSimilarWaveDetails, mergeSimilarWaves, sortTasks, splitToLevels } from './tasks';
import { describe, expect, it } from 'vitest';

type S = components['schemas'];

function makeTask(id: number, prerequisities: number[] | number[][], state: S['Task']['state'] = 'base'): TaskWithIcon {
  return addTaskIcon({
    id,
    title: `task ${id}`,
    author: 1,
    co_author: 1,
    details: 1,
    intro: '',
    max_score: 10,
    time_published: '2024-01-01',
    time_deadline: null,
    state,
    picture_base: 'img/task',
    picture_suffix: '.svg',
    wave: 1,
    feedbacks: 0,
    prerequisities,
  });
}

function makeWave(id: number, caption: string | null, tasks_cnt = 1, sum_points = 10): WaveDetails {
  return {
    id,
    index: id,
    caption,
    garant: 1,
    year: 1,
    public: true,
    sum_points,
    tasks_cnt,
    tasks: [],
  };
}

describe('getTaskLevel', () => {
  it('computes levels from nested prerequisites', () => {
    const tasks = [makeTask(1, []), makeTask(2, [1]), makeTask(3, [[1], [2]]), makeTask(4, [3])];
    const map: { [id: number]: TaskWithIcon } = {};
    tasks.forEach((t) => {
      map[t.id] = t;
    });
    expect(getTaskLevel(map, map[1])).toBe(0);
    expect(getTaskLevel(map, map[2])).toBe(1);
    expect(getTaskLevel(map, map[3])).toBe(2);
    expect(getTaskLevel(map, map[4])).toBe(3);
    expect(getTaskLevel(map, undefined)).toBe(-1);
  });
});

describe('splitToLevels', () => {
  it('groups tasks by dependency depth', () => {
    const tasks = [makeTask(3, [2]), makeTask(1, []), makeTask(2, [1])];
    const levels = splitToLevels(tasks);
    expect(levels.map((l) => l.map((t) => t.id))).toEqual([[1], [2], [3]]);
  });
});

describe('sortTasks', () => {
  it('orders by level without lockedLast', () => {
    const tasks = [makeTask(3, [2]), makeTask(1, []), makeTask(2, [1])];
    expect(sortTasks(tasks, false).map((t) => t.id)).toEqual([1, 2, 3]);
  });

  it('moves locked tasks to the end with lockedLast', () => {
    const tasks = [makeTask(1, [], 'locked'), makeTask(2, [1]), makeTask(3, [])];
    const sorted = sortTasks(tasks, true);
    expect(sorted[sorted.length - 1].id).toBe(1);
    expect(sorted.slice(0, 2).map((t) => t.id).sort()).toEqual([2, 3]);
  });
});

describe('mergeSimilarWaves', () => {
  it('merges waves with "caption -- suffix" into the base wave', () => {
    const waves = [makeWave(1, 'Vlna 1', 2, 20), makeWave(2, 'Vlna 1 -- A', 3, 30), makeWave(3, 'Vlna 2', 1, 10)];
    const merged = mergeSimilarWaves(waves);
    expect(merged.map((w) => w.id)).toEqual([1, 3]);
    expect(merged[0].tasks_cnt).toBe(5);
    expect(merged[0].sum_points).toBe(50);
    expect(merged[0].$mergedWaveIds).toEqual(new Set([2]));
  });

  it('returns waves unchanged when merging is disabled', () => {
    const waves = [makeWave(1, 'Vlna 1'), makeWave(2, 'Vlna 1 -- A')];
    expect(mergeSimilarWaves(waves, false)).toHaveLength(2);
  });
});

describe('mergeSimilarWaveDetails', () => {
  it('moves tasks of merged waves into the surviving wave', () => {
    const base = makeWave(1, 'Vlna 1');
    const extra = makeWave(2, 'Vlna 1 -- A');
    extra.tasks = [makeTask(9, [])];
    const merged = mergeSimilarWaveDetails([base, extra]);
    expect(merged).toHaveLength(1);
    expect(merged[0].tasks.map((t) => t.id)).toEqual([9]);
  });
});
