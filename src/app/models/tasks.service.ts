import { Wave, Task, TaskDetailResponse } from 'src/api';

export interface TaskWithIcon extends Task {
  icon: string;
}

export interface IWave extends Wave {
  $mergedWaveIds?: Set<number>;
}

export interface WaveDetails extends IWave {
  tasks: TaskWithIcon[];
}

export interface TaskFullInfo {
  head: Task;
  detail: TaskDetailResponse
}
