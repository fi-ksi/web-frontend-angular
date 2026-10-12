import React from 'react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../auth/AuthContext';
import { useTask } from '../../hooks/useTasks';
import { ROUTES } from '../../routes';
import { formatKsiDate, translatePoints } from '../../utils/format';
import type { TaskWithIcon } from '../../utils/graphLayout';
import './TaskIcon.scss';

/**
 * Task node shown in the tasks graph: the task's icon with a rich tooltip.
 * Port of the Angular TaskIconComponent. Refreshes its data when the task
 * state changes (e.g. after solving), like the Angular requirements watcher.
 */
export function TaskIcon({ task }: { task: TaskWithIcon }): React.ReactElement {
  const { t } = useTranslation();
  const { isLoggedIn } = useAuth();
  const { task: liveTask } = useTask(task.id);
  const shown = liveTask ?? task;
  const locked = isLoggedIn && shown.state === 'locked';
  const href = locked ? undefined : `/${ROUTES.tasks._}/${shown.id}`;

  const tooltip = (
    <span className="task-icon-tooltip">
      <span className="name" dangerouslySetInnerHTML={{ __html: shown.title.toUpperCase() }} />
      <p className="description" dangerouslySetInnerHTML={{ __html: shown.intro }} />
      <span className="stats">
        {formatKsiDate(shown.time_deadline ?? shown.time_published)},{' '}
        {translatePoints(t, shown.max_score)}
      </span>
    </span>
  );

  const inner = (
    <>
      <img src={shown.icon} alt={t('tasks.graph.task', { name: shown.title })} />
      <span className="invisible-title">{shown.title}</span>
      {tooltip}
    </>
  );

  if (href === undefined) {
    return (
      <span id={`ksi-task-${shown.id}`} className="task-icon disabled">
        <span className="container">{inner}</span>
      </span>
    );
  }
  return (
    <Link id={`ksi-task-${shown.id}`} href={href} className="task-icon">
      <span className="container">{inner}</span>
    </Link>
  );
}
