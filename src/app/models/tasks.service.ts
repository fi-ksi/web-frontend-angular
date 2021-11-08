import { Wave, Task } from "src/api";

export interface WaveDetails extends Wave {
  tasks: Task[];
}
