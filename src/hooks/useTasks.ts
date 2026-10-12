import { useQuery } from '@tanstack/react-query';
import { taskDetailsGetSingle, tasksGetAll, tasksGetSingle, wavesGetAll } from '../api/client';
import type { components } from '../api/schema';
import { getTaskIconUrl, type TaskWithIcon } from '../utils/graphLayout';

type S = components['schemas'];

export type WaveDetails = S['Wave'] & {
  tasks: TaskWithIcon[];
};

function withIcon(task: S['Task']): TaskWithIcon {
  return { ...task, icon: getTaskIconUrl(task) };
}

/**
 * All tasks of the current year, enriched with their icon URLs.
 * Port of the Angular TasksService.tasks$ stream.
 */
export function useTasks(): { tasks: TaskWithIcon[]; isLoading: boolean } {
  const query = useQuery({
    queryKey: ['tasks'],
    queryFn: async (): Promise<TaskWithIcon[]> => {
      const resp = await tasksGetAll();
      return resp.tasks.map(withIcon);
    },
    staleTime: 60_000
  });
  return { tasks: query.data ?? [], isLoading: query.isLoading };
}

/**
 * Single task by id, enriched with its icon URL. Refreshes whenever the
 * task list is invalidated (e.g. after a module submit changed its state).
 */
export function useTask(taskId: number | undefined): { task: TaskWithIcon | null; isLoading: boolean } {
  const { tasks } = useTasks();
  const query = useQuery({
    queryKey: ['task', taskId],
    queryFn: async (): Promise<TaskWithIcon> => withIcon((await tasksGetSingle(taskId!)).task),
    enabled: taskId !== undefined,
    staleTime: 60_000
  });
  const fromList = taskId !== undefined ? tasks.find((t) => t.id === taskId) ?? null : null;
  return { task: query.data ?? fromList, isLoading: query.isLoading };
}

/**
 * Full task details (body, modules, scores) for the task detail page.
 */
export function useTaskDetails(taskId: number | undefined): {
  details: S['TaskDetailResponse'] | null;
  isLoading: boolean;
} {
  const query = useQuery({
    queryKey: ['taskDetails', taskId],
    queryFn: async (): Promise<S['TaskDetailResponse']> => taskDetailsGetSingle(taskId!),
    enabled: taskId !== undefined,
    staleTime: 30_000
  });
  return { details: query.data ?? null, isLoading: query.isLoading };
}

/**
 * Waves with their tasks attached. Port of TasksService.waveDetails$.
 */
export function useWaveDetails(): { waves: WaveDetails[]; isLoading: boolean } {
  const { tasks } = useTasks();
  const query = useQuery({
    queryKey: ['waves'],
    queryFn: async (): Promise<S['Wave'][]> => (await wavesGetAll()).waves,
    staleTime: 60_000
  });
  const waves: WaveDetails[] = (query.data ?? []).map((wave) => ({
    ...wave,
    tasks: tasks.filter((task) => task.wave === wave.id)
  }));
  return { waves, isLoading: query.isLoading };
}
