import { BarValue } from 'ngx-bootstrap/progressbar/progressbar-type.interface';

export interface UserProgress {
  title: string;
  tasksSolved: number;
  score: number;
  bars: BarValue[];
}

export type WaveScore = {[waveId: number]: {title: string; max: number, current: number, solved: number}};

export type TaskIDWithScore = {id: number, score?: number};
