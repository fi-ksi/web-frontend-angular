import type { components } from '../api/schema';
import type { IWave, TaskWithIcon, WaveDetails } from '../types';
import { flatArray, getTaskIconURL } from './utils';

type S = components['schemas'];

export type TasksMap = { [taskId: number]: TaskWithIcon };
type TasksLevelMap = { [taskId: number]: number };
type TasksLevels = { [level: number]: TaskWithIcon[] };

/**
 * Adds the state icon URL to a task (port of TasksService.taskAddIcon)
 */
export function addTaskIcon(task: S['Task']): TaskWithIcon {
  return {
    ...task,
    icon: getTaskIconURL(task),
  };
}

/**
 * Builds an id -> task lookup map
 */
export function createTasksMap(tasks: TaskWithIcon[], saveInto?: TasksMap): TasksMap {
  const r: TasksMap = typeof saveInto === 'undefined' ? {} : saveInto;
  tasks.forEach((t) => {
    r[t.id] = t;
  });
  return r;
}

/**
 * Computes the dependency level of a task (1 + max level of its prerequisites,
 * 0 for tasks without prerequisites)
 */
export function getTaskLevel(
  tasksMap: TasksMap,
  task?: TaskWithIcon,
  knownLevels?: TasksLevelMap,
  taskLevels?: TasksLevels
): number {
  if (typeof task === 'undefined' || !(task.id in tasksMap)) {
    return -1;
  }
  if (typeof knownLevels === 'undefined') {
    knownLevels = {};
  }
  if (task.id in knownLevels) {
    return knownLevels[task.id];
  }
  const requirementIds = [...flatArray(task.prerequisities)];
  const level =
    1 +
    Math.max(
      -1,
      ...requirementIds.map((requirementId) =>
        getTaskLevel(tasksMap, tasksMap[requirementId], knownLevels, taskLevels)
      )
    );
  knownLevels[task.id] = level;
  if (typeof taskLevels !== 'undefined') {
    if (!(level in taskLevels)) {
      taskLevels[level] = [];
    }
    taskLevels[level].push(task);
  }
  return level;
}

/**
 * Splits tasks into levels by their prerequisite depth
 */
export function splitToLevels(tasks: TaskWithIcon[], saveTaskMap?: TasksMap): TaskWithIcon[][] {
  if (typeof saveTaskMap === 'undefined') {
    saveTaskMap = {};
  }
  createTasksMap(tasks, saveTaskMap);
  const taskLevels: TasksLevels = {};
  const levels: TaskWithIcon[][] = [];
  const levelsCache: TasksLevelMap = {};

  tasks.forEach((t) => getTaskLevel(saveTaskMap as TasksMap, t, levelsCache, taskLevels));
  const maxLevel = Math.max(...Object.keys(taskLevels).map((x) => Number(x)));
  for (let level = 0; level <= maxLevel; level++) {
    levels.push(taskLevels[level]);
  }

  return levels;
}

/**
 * Orders tasks by dependency level; when lockedLast is set, locked tasks are moved to the end
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

/**
 * Merges waves whose caption starts with "<other caption> -- " into that wave.
 * When merge is disabled the waves are returned unchanged.
 */
export function mergeSimilarWaves<T extends IWave>(waves: T[], merge = true): T[] {
  if (!merge) {
    return waves;
  }

  const similarWaves: { [caption: string]: T[] } = {};
  waves.forEach((w) => {
    const caption = w.caption ?? '';
    const similarName = Object.keys(similarWaves).find((name) => caption.startsWith(`${name} -- `));
    if (similarName) {
      similarWaves[similarName].push(w);
    } else {
      similarWaves[caption] = [];
    }
  });

  return waves
    .filter((w) => (w.caption ?? '') in similarWaves)
    .map((w) => {
      const similar = similarWaves[w.caption ?? ''];
      w.$mergedWaveIds = new Set(similar.map((w2) => w2.id));
      w.tasks_cnt += similar.map((w2) => w2.tasks_cnt).reduce((p, a) => p + a, 0);
      w.sum_points += similar.map((w2) => w2.sum_points).reduce((p, a) => p + a, 0);
      return w;
    });
}

/**
 * Merges similar wave details and moves the tasks of merged waves into the surviving wave
 */
export function mergeSimilarWaveDetails(waves: WaveDetails[], merge = true): WaveDetails[] {
  const mergedWaveIDs = new Set<number>();

  return mergeSimilarWaves(waves, merge)
    .map((wave) => {
      if (wave.$mergedWaveIds !== undefined) {
        wave.$mergedWaveIds.forEach((waveId) => {
          mergedWaveIDs.add(waveId);
          const similarWave = waves.find((x) => x.id === waveId);
          if (similarWave === undefined) {
            return;
          }
          wave.tasks.push(...similarWave.tasks);
        });
      }

      return wave;
    })
    .filter((wave) => !mergedWaveIDs.has(wave.id));
}
