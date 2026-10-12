import type { components } from '../api/schema';

type S = components['schemas'];

/**
 * A task enriched with the URL of its state icon.
 * Port of the Angular `TaskWithIcon` model.
 */
export type TaskWithIcon = S['Task'] & {
  icon: string;
};

export type TasksMap = Record<number, TaskWithIcon>;

type RecursiveArray<T> = (T | RecursiveArray<T>)[];

/**
 * Flattens arbitrarily nested arrays. Port of `Utils.flatArray`.
 */
export function flatArray<T>(array: RecursiveArray<T>): T[] {
  const result: T[] = [];
  for (const item of array) {
    if (Array.isArray(item)) {
      result.push(...flatArray(item as RecursiveArray<T>));
    } else {
      result.push(item);
    }
  }
  return result;
}

/**
 * URL of the task's icon image, derived from its picture base path and state.
 * Port of `Utils.getTaskIconURL`.
 */
export function getTaskIconUrl(task: S['Task']): string {
  const backend = (process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3030/').replace(/\/$/, '');
  const fix = (url: string): string => url.replace(/([^:])\/\//g, '$1/');
  return fix(fix(`${backend}/${task.picture_base}/${task.state}${task.picture_suffix}`));
}

function getTaskLevel(
  taskMap: TasksMap,
  task: TaskWithIcon | undefined,
  knownLevels: Record<number, number> = {},
  taskLevels?: Record<number, TaskWithIcon[]>
): number {
  if (typeof task === 'undefined' || !(task.id in taskMap)) {
    return -1;
  }
  if (task.id in knownLevels) {
    return knownLevels[task.id];
  }
  const requirementIds = [...flatArray(task.prerequisities)];
  const level = 1 + Math.max(-1, ...requirementIds.map((requirementId) =>
    getTaskLevel(taskMap, taskMap[requirementId], knownLevels, taskLevels)
  ));
  knownLevels[task.id] = level;
  if (typeof taskLevels !== 'undefined') {
    (taskLevels[level] ??= []).push(task);
  }
  return level;
}

/**
 * Splits tasks into levels so that every task sits one level below its
 * highest prerequisite. Port of `TasksService.splitToLevels`.
 *
 * @param tasks tasks to split
 * @param saveTaskMap optional map filled with all tasks by id
 */
export function splitToLevels(tasks: TaskWithIcon[], saveTaskMap: TasksMap = {}): TaskWithIcon[][] {
  tasks.forEach((task) => {
    saveTaskMap[task.id] = task;
  });
  const taskLevels: Record<number, TaskWithIcon[]> = {};
  const levelsCache: Record<number, number> = {};
  tasks.forEach((task) => getTaskLevel(saveTaskMap, task, levelsCache, taskLevels));
  const levelKeys = Object.keys(taskLevels).map(Number);
  if (levelKeys.length === 0) {
    return [];
  }
  const maxLevel = Math.max(...levelKeys);
  const levels: TaskWithIcon[][] = [];
  for (let level = 0; level <= maxLevel; level++) {
    levels.push(taskLevels[level] ?? []);
  }
  return levels;
}

/**
 * Orders tasks inside each level to minimize the number of crossing
 * dependency arrows between the levels.
 *
 * Uses the barycenter heuristic (a step of the Sugiyama layered graph
 * drawing method): in alternating top-down and bottom-up sweeps, tasks
 * in each level are sorted by the average normalized position of their
 * neighbours in the other levels. Tasks without known neighbours keep
 * their relative order (the sort is stable), so the result is deterministic.
 *
 * Port of `TasksService.minimizeEdgeCrossings` (PR #131).
 *
 * @param levels task levels as returned by {@link splitToLevels} (reordered in place)
 * @param taskMap map of all tasks by id (as filled by {@link splitToLevels})
 * @returns the same levels array, for chaining
 */
export function minimizeEdgeCrossings(levels: TaskWithIcon[][], taskMap: TasksMap): TaskWithIcon[][] {
  if (levels.length < 2) {
    return levels;
  }

  // successors[taskId] = ids of tasks that directly depend on it
  const successors: Record<number, number[]> = {};
  flatArray(levels).forEach((task) => {
    flatArray(task.prerequisities).forEach((prereqId) => {
      if (!(prereqId in taskMap)) {
        return;
      }
      (successors[prereqId] ??= []).push(task.id);
    });
  });

  const predecessorsOf = (task: TaskWithIcon): number[] =>
    flatArray(task.prerequisities).filter((id) => id in taskMap);
  const successorsOf = (task: TaskWithIcon): number[] =>
    (successors[task.id] ?? []).filter((id) => id in taskMap);

  // normalized horizontal position of each task inside its level, in [0, 1]
  const buildPositions = (): Record<number, number> => {
    const positions: Record<number, number> = {};
    levels.forEach((level) => {
      (level || []).forEach((task, index) => {
        positions[task.id] = level.length > 1 ? index / (level.length - 1) : 0.5;
      });
    });
    return positions;
  };

  const MAX_SWEEPS = 4;
  for (let sweep = 0; sweep < MAX_SWEEPS; sweep++) {
    let changed = false;
    // top-down sweep: order each level by its predecessors
    for (let l = 0; l < levels.length; l++) {
      changed = orderLevelByBarycenter(levels, l, predecessorsOf, buildPositions()) || changed;
    }
    // bottom-up sweep: order each level by its successors
    for (let l = levels.length - 1; l >= 0; l--) {
      changed = orderLevelByBarycenter(levels, l, successorsOf, buildPositions()) || changed;
    }
    if (!changed) {
      break;
    }
  }

  return levels;
}

/**
 * Sorts a single level by the barycenter (average normalized position)
 * of each task's neighbours. The sort is stable, so tasks with equal
 * barycenters (including tasks without neighbours) keep their order.
 *
 * @returns true if the order of the level changed
 */
function orderLevelByBarycenter(
  levels: TaskWithIcon[][],
  levelIndex: number,
  neighboursOf: (task: TaskWithIcon) => number[],
  positions: Record<number, number>
): boolean {
  const level = levels[levelIndex] || [];
  if (level.length < 2) {
    return false;
  }
  const decorated = level.map((task, index) => {
    const neighbours = neighboursOf(task).filter((id) => id in positions);
    const barycenter = neighbours.length === 0
      // no known neighbours: keep the current relative position
      ? positions[task.id]
      : neighbours.reduce((sum, id) => sum + positions[id], 0) / neighbours.length;
    return { task, index, barycenter };
  });
  decorated.sort((a, b) => (a.barycenter - b.barycenter) || (a.index - b.index));
  if (decorated.every((d, i) => d.task === level[i])) {
    return false;
  }
  levels[levelIndex] = decorated.map((d) => d.task);
  return true;
}

/**
 * Flattens tasks level by level; optionally moves locked tasks to the end.
 * Port of `TasksService.sortTasks`.
 */
export function sortTasks(tasks: TaskWithIcon[], lockedLast: boolean): TaskWithIcon[] {
  const flatLevels = flatArray(splitToLevels(tasks));
  if (!lockedLast) {
    return flatLevels;
  }
  const locked: TaskWithIcon[] = [];
  const unlocked = flatLevels.filter((task) => {
    if (task.state === 'locked') {
      locked.push(task);
      return false;
    }
    return true;
  });
  return [...unlocked, ...locked];
}
