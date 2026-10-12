import type { components } from './api/schema';

type S = components['schemas'];

/* ------------------------------------------------------------------ */
/* Port of src/app/models/years.service.ts                             */
/* ------------------------------------------------------------------ */

export type IYear = S['Year'] & { $newest?: boolean };

export type YearSelect = Pick<IYear, 'year' | 'id' | '$newest'>;

/* ------------------------------------------------------------------ */
/* Port of src/app/models/users-cache.service.ts                       */
/* ------------------------------------------------------------------ */

export type IUser = S['User'] & {
  $isAdmin: boolean;
  $isOrg: boolean;
  $year: YearSelect | null;
  $fullName: string;
  $hasPicture: boolean;
}

/* ------------------------------------------------------------------ */
/* Port of src/app/models/window.service.ts                            */
/* ------------------------------------------------------------------ */

export interface WindowSize {
  height: number;
  width: number;
}

export interface PageScroll {
  depth: number;
  change: number;
}

/* ------------------------------------------------------------------ */
/* Port of src/app/models/tasks.service.ts                             */
/* ------------------------------------------------------------------ */

export type TaskWithIcon = S['Task'] & {
  icon: string;
}

export type IWave = S['Wave'] & {
  $mergedWaveIds?: Set<number>;
}

export interface WaveDetails extends IWave {
  tasks: TaskWithIcon[];
}

export interface TaskFullInfo {
  head: S['Task'];
  detail: S['TaskDetailResponse'];
}

/* ------------------------------------------------------------------ */
/* Port of src/app/models/admin-task.service.ts                        */
/*                                                                     */
/* NOTE: the Angular version exposed the deploy permissions as         */
/* observables ($canBeDeployed$ etc.); in React they are plain         */
/* booleans computed by the admin task page from useAuth() + waves.    */
/* ------------------------------------------------------------------ */

export type IAdminTask = S['AdminTask'] & {
  $canBeDeployed: boolean;
  $canBeDeleted: boolean;
  $canBeMerged: boolean;
  $isStableDeployState: boolean;
  $isMerged: boolean;
}

/* ------------------------------------------------------------------ */
/* Port of src/app/models/module.service.ts (types only)               */
/* ------------------------------------------------------------------ */

export interface ModuleSubmitChange {
  module: S['KSIModule'];
  result: S['ModuleSubmitResponse'] | null;
}

export type ISortableItem = S['SortableItem'] & {
  $fixed: boolean;
  $absOffset?: number;
  $itemAfter?: ISortableItem;
  $placement?: 'left' | 'right';
  $id: string;
}

/* ------------------------------------------------------------------ */
/* Port of src/app/models/discussion.ts                                */
/* ------------------------------------------------------------------ */

export type PostsMap = { [postId: number]: S['Post'] };

export type PostReplyMode = 'reply' | 'edit' | 'new-thread';

/* ------------------------------------------------------------------ */
/* Port of src/app/models/profile.ts                                   */
/* ------------------------------------------------------------------ */

export interface ProgressBarValue {
  value: number;
  max?: number;
  type?: string;
}

export interface UserProgress {
  title: string;
  tasksSolved: number;
  score: number;
  bars: ProgressBarValue[];
}

export type WaveScore = { [waveId: number]: { title: string; max: number; current: number; solved: number } };

export type TaskIDWithScore = { id: number; score?: number };

/* ------------------------------------------------------------------ */
/* Port of src/app/models/wave.ts                                      */
/* ------------------------------------------------------------------ */

export type WaveView = 'linear' | 'wave-graph' | 'graph';

/* ------------------------------------------------------------------ */
/* Port of src/app/models/prediction.ts                                */
/* ------------------------------------------------------------------ */

export interface IPrediction {
  percentFromTotalNeeded: number;
  doable: boolean;
}

/* ------------------------------------------------------------------ */
/* Port of src/app/models/changelog.service.ts                         */
/* ------------------------------------------------------------------ */

export interface ChangelogItem {
  subject: string;
  author: {
    date: string;
  };
}

export type Changelog = ChangelogItem[];

/* ------------------------------------------------------------------ */
/* Port of src/app/models/edulint.service.ts                           */
/*                                                                     */
/* NOTE: the Angular edulint API codegen has no React equivalent yet;  */
/* problems is opaque here until the programming module is ported.     */
/* ------------------------------------------------------------------ */

export interface EdulintReport {
  problems: unknown[];
  editorUrl: string;
}

/* ------------------------------------------------------------------ */
/* Port of src/app/models/admin-email.ts                               */
/* ------------------------------------------------------------------ */

export interface EmailResult {
  success: boolean;
  count: number;
  error?: string;
}

/* ------------------------------------------------------------------ */
/* Port of src/app/models/EditMode.ts                                  */
/* ------------------------------------------------------------------ */

export enum EditMode {
  New = 'New',
  Update = 'Update',
}
