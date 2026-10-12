import React from 'react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../auth/AuthContext';
import { useTask } from '../../hooks/useTasks';
import { ROUTES } from '../../routes';
import { formatKsiDate, translatePoints } from '../../utils/format';
import type { TaskWithIcon } from '../../utils/graphLayout';
import './WaveTaskLinear.scss';

/**
 * One task as a row of the linear wave view.
 * Port of the Angular WaveTaskLinearComponent.
 */
export function WaveTaskLinear({ task }: { task: TaskWithIcon }): React.ReactElement {
  const { t } = useTranslation();
  const { isLoggedIn } = useAuth();
  const { task: liveTask } = useTask(task.id);
  const shown = liveTask ?? task;
  const locked = isLoggedIn && shown.state === 'locked';

  const className = `list-group-item list-group-item-action list-item-task${locked ? ' disabled' : ''}`;
  const href = locked ? undefined : `/${ROUTES.tasks._}/${shown.id}`;

  const inner = (
    <>
      <img src={shown.icon} alt="" className="icon" />
      <span className="name" dangerouslySetInnerHTML={{ __html: shown.title }} />
      <span className="description" dangerouslySetInnerHTML={{ __html: shown.intro }} />
      <span className="deadline">
        {t('tasks.deadline')}: {formatKsiDate(shown.time_deadline ?? shown.time_published)},{' '}
        {translatePoints(t, shown.max_score)}
      </span>
    </>
  );

  if (href === undefined) {
    return <span className={className}>{inner}</span>;
  }
  return (
    <Link href={href} className={className}>
      {inner}
    </Link>
  );
}
