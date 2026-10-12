import React from 'react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { ROUTES } from '../../routes';
import { useUser } from '../../hooks/useUsers';
import { fullName } from '../../utils/utils';
import './UsersInline.scss';

interface UsersInlineProps {
  users: number[];
  showRoles?: boolean;
}

function UserInline({ userId, showRoles }: { userId: number; showRoles: boolean }) {
  const { t } = useTranslation();
  const { user } = useUser(userId);

  if (!user) return null;

  return (
    <span className="user">
      <Link href={`/${ROUTES.profile._}/${user.id}`}>
        <img className="pic" src={user.profile_picture} alt="" />
        <span className="name">{fullName(user)}</span>
      </Link>
      {showRoles && <span className="role">- {t(`user.role.${user.role}.${user.gender}`)}</span>}
    </span>
  );
}

/**
 * Inline list of users separated by "and", each linking to their profile.
 */
export function UsersInline({ users, showRoles = false }: UsersInlineProps): React.ReactElement {
  const { t } = useTranslation();

  return (
    <span className="users-inline">
      {users.map((userId, index) => (
        <React.Fragment key={userId}>
          <UserInline userId={userId} showRoles={showRoles} />
          {index + 1 < users.length && <span> {t('tasks.author.and')} </span>}
        </React.Fragment>
      ))}
    </span>
  );
}
