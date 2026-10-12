import { describe, expect, it } from 'vitest';
import {
  flatArray,
  minimizeEdgeCrossings,
  sortTasks,
  splitToLevels,
  type TaskWithIcon,
  type TasksMap
} from './graphLayout';

function task(id: number, prerequisities: number[] = [], state: TaskWithIcon['state'] = 'base'): TaskWithIcon {
  return {
    id,
    prerequisities,
    state,
    title: `Task ${id}`,
    author: 1,
    co_author: 1,
    details: id,
    intro: '',
    max_score: 10,
    time_published: '2026-01-01',
    time_deadline: null,
    picture_base: '/img',
    picture_suffix: '.svg',
    wave: 1,
    feedbacks: 1,
    icon: `/img/${id}.svg`
  };
}

function taskMapOf(levels: TaskWithIcon[][]): TasksMap {
  const map: TasksMap = {};
  levels.forEach((level) => level.forEach((t) => {
    map[t.id] = t;
  }));
  return map;
}

describe('minimizeEdgeCrossings', () => {
  it('reorders a level so that dependency arrows do not cross', () => {
    // A -> Y, B -> X ; input order [X, Y] draws two crossing arrows
    const a = task(1);
    const b = task(2);
    const x = task(3, [2]);
    const y = task(4, [1]);
    const levels = [[a, b], [x, y]];

    minimizeEdgeCrossings(levels, taskMapOf(levels));

    expect(levels[1].map((t) => t.id)).toEqual([4, 3]);
  });

  it('propagates ordering through multiple levels', () => {
    // A -> X -> P, B -> Y -> Q ; crossed in both level 1 and level 2
    const a = task(1);
    const b = task(2);
    const x = task(3, [1]);
    const y = task(4, [2]);
    const p = task(5, [3]);
    const q = task(6, [4]);
    const levels = [[a, b], [y, x], [q, p]];

    minimizeEdgeCrossings(levels, taskMapOf(levels));

    expect(levels[1].map((t) => t.id)).toEqual([3, 4]);
    expect(levels[2].map((t) => t.id)).toEqual([5, 6]);
  });

  it('keeps the relative order of tasks without known neighbours', () => {
    const a = task(1);
    const b = task(2);
    const x = task(3, [99]); // prerequisity not in the task map
    const y = task(4, [98]); // prerequisity not in the task map
    const levels = [[a, b], [x, y]];

    minimizeEdgeCrossings(levels, taskMapOf(levels));

    expect(levels[0].map((t) => t.id)).toEqual([1, 2]);
    expect(levels[1].map((t) => t.id)).toEqual([3, 4]);
  });

  it('handles empty input', () => {
    expect(minimizeEdgeCrossings([], {})).toEqual([]);
  });

  it('untangles a fan-in: task with two prerequisites sorts between them', () => {
    // level 0: [a, b]; level 1 input [y, x]: x <- a, y <- a,b
    // barycenter(x) = 0, barycenter(y) = 0.5  =>  [x, y]
    const a = task(1);
    const b = task(2);
    const x = task(3, [1]);
    const y = task(4, [1, 2]);
    const levels = [[a, b], [y, x]];

    minimizeEdgeCrossings(levels, taskMapOf(levels));

    expect(levels[1].map((t) => t.id)).toEqual([3, 4]);
  });

  it('is stable: equal barycenters keep their input order', () => {
    // both x and y depend on both a and b -> barycenter 0.5 for both
    const a = task(1);
    const b = task(2);
    const x = task(3, [1, 2]);
    const y = task(4, [1, 2]);
    const levels = [[a, b], [x, y]];

    minimizeEdgeCrossings(levels, taskMapOf(levels));

    expect(levels[1].map((t) => t.id)).toEqual([3, 4]);
  });

  it('is idempotent: a second run changes nothing', () => {
    const a = task(1);
    const b = task(2);
    const x = task(3, [2]);
    const y = task(4, [1]);
    const levels = [[a, b], [x, y]];
    const map = taskMapOf(levels);

    minimizeEdgeCrossings(levels, map);
    const afterFirst = levels.map((level) => level.map((t) => t.id));
    minimizeEdgeCrossings(levels, map);

    expect(levels.map((level) => level.map((t) => t.id))).toEqual(afterFirst);
    expect(afterFirst[1]).toEqual([4, 3]);
  });

  it('resolves a crossing even when the upper level has no predecessors', () => {
    // level 0 input [b, a]: a -> x, b -> y, level 1 input [x, y]
    // level 0 has no predecessors, so the top-down sweep cannot move it;
    // instead the sweep reorders level 1 to [y, x] and no arrows cross.
    const a = task(1);
    const b = task(2);
    const x = task(3, [1]);
    const y = task(4, [2]);
    const levels = [[b, a], [x, y]];

    minimizeEdgeCrossings(levels, taskMapOf(levels));

    expect(levels[0].map((t) => t.id)).toEqual([2, 1]);
    expect(levels[1].map((t) => t.id)).toEqual([4, 3]);
  });
});

describe('splitToLevels', () => {
  it('places each task one level below its highest prerequisite', () => {
    const a = task(1);
    const b = task(2, [1]);
    const c = task(3, [1, 2]);
    const d = task(4);

    const levels = splitToLevels([c, a, d, b]);

    expect(levels.map((level) => level.map((t) => t.id))).toEqual([[1, 4], [2], [3]]);
  });

  it('ignores prerequisites missing from the task list', () => {
    const a = task(1, [99]);

    const levels = splitToLevels([a]);

    expect(levels.map((level) => level.map((t) => t.id))).toEqual([[1]]);
  });

  it('handles empty input', () => {
    expect(splitToLevels([])).toEqual([]);
  });

  it('fills the provided task map', () => {
    const a = task(1);
    const map: TasksMap = {};

    splitToLevels([a], map);

    expect(map[1]).toBe(a);
  });
});

describe('sortTasks', () => {
  it('flattens levels in order', () => {
    const a = task(1);
    const b = task(2, [1]);

    expect(sortTasks([b, a], false).map((t) => t.id)).toEqual([1, 2]);
  });

  it('moves locked tasks last when requested', () => {
    const a = task(1);
    const locked = task(2, [], 'locked');

    expect(sortTasks([locked, a], true).map((t) => t.id)).toEqual([1, 2]);
  });
});

describe('flatArray', () => {
  it('flattens nested arrays', () => {
    expect(flatArray([1, [2, [3]], 4])).toEqual([1, 2, 3, 4]);
  });
});
