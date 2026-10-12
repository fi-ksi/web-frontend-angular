import React, { useMemo } from 'react';
import type { WaveDetails } from '../../hooks/useTasks';
import { sortTasks } from '../../utils/graphLayout';
import { TasksGraph } from './TasksGraph';
import { WaveTaskLinear } from './WaveTaskLinear';

export type WaveView = 'linear' | 'wave-graph' | 'graph';

/**
 * One wave: either a linear list of tasks or a tasks graph.
 * Port of the Angular WaveComponent.
 */
export function Wave({ wave, viewMode }: { wave: WaveDetails; viewMode: WaveView }): React.ReactElement {
  // tasks ordered so that all requirements of a task come before it
  const tasksOrdered = useMemo(() => sortTasks(wave.tasks, true), [wave.tasks]);

  if (viewMode === 'linear') {
    return (
      <div className="list-group">
        {tasksOrdered.map((task) => (
          <WaveTaskLinear key={task.id} task={task} />
        ))}
      </div>
    );
  }
  return <TasksGraph tasks={tasksOrdered} />;
}
