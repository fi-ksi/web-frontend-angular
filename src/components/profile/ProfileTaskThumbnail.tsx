import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { tasksGetSingle } from '../../api/client';
import { ROUTES } from '../../routes';
import { getTaskIconUrl } from './profile-utils';
import './ProfileTaskThumbnail.scss';

interface ProfileTaskThumbnailProps {
  taskId: number;
  score?: number | null;
}

/**
 * Thumbnail of a task on a user profile: icon, title and (when given) the score.
 */
export function ProfileTaskThumbnail({ taskId, score }: ProfileTaskThumbnailProps) {
  const { data: task } = useQuery({
    queryKey: ['task', taskId],
    queryFn: () => tasksGetSingle(taskId).then((r) => r.task),
    retry: (failureCount, error) => {
      // 4xx means the task is e.g. unpublished for this viewer; do not retry
      const status = (error as { status?: number })?.status;
      if (status && Math.floor(status / 100) === 4) {
        return false;
      }
      return failureCount < 3;
    }
  });

  if (!task) {
    return null;
  }

  return (
    <Link href={`/${ROUTES.tasks._}/${taskId}`} className="profile-task-thumbnail">
      <div className="icon-container">
        <img className="icon" src={getTaskIconUrl(task)} alt="" />
      </div>
      <div className="name">
        <div>{task.title}</div>
      </div>
      {score !== undefined && (
        <div className="description">
          <div className="score">
            {score !== null ? score : '-'}/{task.max_score}
          </div>
        </div>
      )}
    </Link>
  );
}
