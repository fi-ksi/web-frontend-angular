import { Wave, Task } from "src/api";

export interface TaskWithIcon extends Task {
  icon: string;
}

export interface WaveDetails extends Wave {
  tasks: TaskWithIcon[];
}
