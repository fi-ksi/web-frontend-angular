import type { components } from '../../api/schema';

type S = components['schemas'];

export const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3030/';

/**
 * Collapse duplicated slashes in a URL (keeps the protocol part intact).
 */
export function fixUrl(url: string): string {
  const replace = (x: string): string => x.replace(/([^:])\/\//g, '$1/');
  return replace(replace(url));
}

/**
 * Avatar URL for a user: backend-hosted picture when set, otherwise a local
 * default avatar (women get the -woman variant).
 */
export function getProfilePictureUrl(
  user: Pick<S['User'], 'profile_picture' | 'gender'>,
  isOrg: boolean
): string {
  if (user.profile_picture) {
    return fixUrl(`${BACKEND_URL}${user.profile_picture}`);
  }
  return `/assets/img/avatar/${isOrg ? 'org' : 'default'}${user.gender === 'male' ? '' : '-woman'}.svg`;
}

/**
 * Full display name, including the nick name when present.
 */
export function getFullName(user: Pick<S['User'], 'first_name' | 'last_name' | 'nick_name'>): string {
  return `${user.first_name}${user.nick_name ? ` "${user.nick_name}"` : ''} ${user.last_name}`;
}

/**
 * Task icon URL derived from the task state.
 */
export function getTaskIconUrl(task: Pick<S['Task'], 'picture_base' | 'state' | 'picture_suffix'>): string {
  return fixUrl(`${BACKEND_URL}${task.picture_base}/${task.state}${task.picture_suffix}`);
}

/**
 * Port of mergeSimilarWaves: merges waves whose caption is "X -- Y" into wave X,
 * accumulating sum_points and tasks_cnt, and remembering the merged wave ids.
 */
export function mergeSimilarWaves<T extends S['Wave']>(waves: T[]): (T & { mergedWaveIds?: Set<number> })[] {
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
      const mergedWaveIds = new Set(similar.map((w2) => w2.id));
      return {
        ...w,
        sum_points: w.sum_points + similar.reduce((sum, w2) => sum + w2.sum_points, 0),
        tasks_cnt: w.tasks_cnt + similar.reduce((sum, w2) => sum + w2.tasks_cnt, 0),
        mergedWaveIds
      };
    });
}

export interface ProgressBarSegment {
  type: 'success' | 'warning' | 'info';
  value: number;
  max: number;
  label: string;
}

/**
 * Two-segment progress bar: current score vs. the remaining points needed
 * to reach the required threshold (60 %).
 */
export function generateProgressBar(points: number, maxPoints: number, requiredPercentage = 60): ProgressBarSegment[] {
  const currentPercentage = maxPoints > 0 ? Math.floor((100 * points) / maxPoints) : 0;
  const leftRequiredPercentage = Math.max(0, requiredPercentage - currentPercentage);
  const currentUserPercentageFloored = Math.floor(currentPercentage);

  return [
    {
      type: leftRequiredPercentage <= 0 ? 'success' : 'warning',
      value: currentPercentage,
      max: 100,
      label: currentPercentage >= 50 ? `${currentUserPercentageFloored}%` : ''
    },
    {
      type: 'info',
      value: leftRequiredPercentage,
      max: 100,
      label: currentPercentage < 50 ? `${currentUserPercentageFloored}%` : ''
    }
  ];
}

export interface TaskScoreRef {
  id: number;
  score?: number | null;
}

export interface Prediction {
  percentFromTotalNeeded: number;
  doable: boolean;
}

/**
 * Predicts whether the user can still reach the successful threshold:
 * the prediction is possible only when the scores are visible, and it is
 * doable when the points the user missed (tasks whose deadline passed and
 * which were never submitted) do not push them below the 40 % slack.
 */
export function generatePrediction(
  tasks: Pick<S['Task'], 'id' | 'time_deadline' | 'max_score'>[],
  scores: TaskScoreRef[],
  currentPoints: number,
  maxScore: number
): Prediction | null {
  if (scores.length === 0) {
    return null;
  }

  const unpublishedTaskIds = new Set(
    scores.filter((task) => task.score === undefined || task.score === null).map((task) => task.id)
  );
  const today = new Date();

  let missedScore = 0;
  for (const task of tasks) {
    if (!task.time_deadline) {
      continue;
    }
    const deadlineDate = new Date(task.time_deadline);
    if (!unpublishedTaskIds.has(task.id) && deadlineDate < today) {
      missedScore += task.max_score;
    }
  }

  const percentNeeded = maxScore > 0 ? 60 - Math.floor((100 * currentPoints) / maxScore) : 60;

  return {
    percentFromTotalNeeded: percentNeeded,
    doable: missedScore - currentPoints <= maxScore * 0.4
  };
}

export interface UserProgress {
  title: string;
  tasksSolved: number;
  score: number;
  bars: ProgressBarSegment[];
}

export type PositionedUser = S['User'] & {
  position: string;
};

export type GenderKey = 'male' | 'female';

/** Gender suffix used by the gendered cs.json keys. */
export function genderKey(gender?: string): GenderKey {
  return gender === 'female' ? 'female' : 'male';
}

/** Localized role name, mirroring the Angular translateRole pipe. */
export function translateRole(
  user: Pick<S['User'], 'role' | 'gender'>,
  t: (key: string) => string
): string {
  return t(`user.role.${user.role}.${user.gender}`);
}

/** Localized skill level from the number of participated seasons. */
export function translateSkillLevel(
  user: Pick<S['User'], 'seasons' | 'gender'>,
  t: (key: string) => string
): string {
  const ksiSeasons = user.seasons?.length || 0;
  let skill: string;
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
  return t(`user.skill.${skill}.${user.gender}`);
}

function getScoreKey(user: Pick<S['User'], 'score' | 'cheat'>): number {
  return !user.cheat ? user.score : -1000;
}

/**
 * Sorts users by score (cheaters last) and assigns dense positions,
 * e.g. "1.", "2.-4.".
 */
export function countPositions(users: S['User'][]): PositionedUser[] {
  const scoresCount: { [score: number]: number } = {};
  const scores: number[] = [];
  const scorePositions: { [score: number]: { from: number; to: number } } = {};

  users.forEach((u) => {
    const key = getScoreKey(u);
    if (!(key in scoresCount)) {
      scores.push(key);
      scoresCount[key] = 0;
    }
    scoresCount[key] = scoresCount[key] + 1;
  });

  let previousEndingPos = 1;
  for (const score of scores.sort((a, b) => b - a)) {
    scorePositions[score] = {
      from: previousEndingPos,
      to: previousEndingPos + scoresCount[score] - 1
    };
    previousEndingPos = scorePositions[score].to + 1;
  }

  return users
    .map((user) => {
      const key = getScoreKey(user);
      return {
        ...user,
        position:
          scorePositions[key].from === scorePositions[key].to
            ? `${scorePositions[key].from}.`
            : `${scorePositions[key].from}.-${scorePositions[key].to}.`
      };
    })
    .sort((a, b) => getScoreKey(b) - getScoreKey(a));
}
