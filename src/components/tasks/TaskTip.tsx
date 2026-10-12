import React from 'react';
import Link from 'next/link';
import { ROUTES } from '../../routes';
import { useUser } from '../../hooks/useUsers';
import { TaskBody } from './TaskBody';
import './TaskTip.scss';

interface TaskTipProps {
  title: string;
  content: string;
  author: number | null;
  image?: string | null;
}

/**
 * A highlighted tip box inside task text, optionally with the author's
 * profile picture. Port of the Angular TaskTipComponent.
 */
export function TaskTip({ title, content, author, image }: TaskTipProps): React.ReactElement {
  const { user } = useUser(author ?? undefined);
  // An explicit `image` always wins over the author's profile picture,
  // but `author` (if also given) still drives the profile link.
  const imageSrc = image ?? user?.profile_picture ?? '/assets/img/karlik_color.png';

  const icon = (
    <span className="icon">
      <img src={imageSrc} alt="" />
    </span>
  );

  return (
    <div className="task-tip">
      {author ? (
        <Link href={`/${ROUTES.profile._}/${author}`} title={user?.first_name} className="icon-link">
          {icon}
        </Link>
      ) : (
        icon
      )}
      <div className="content">
        <b>{title}</b>:{' '}
        <span className="text">
          <TaskBody body={content} />
        </span>
      </div>
    </div>
  );
}
