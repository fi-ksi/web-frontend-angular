import React from 'react';
import Link from 'next/link';
import { ROUTES } from '../../routes';
import { useUser } from '../../hooks/useUsers';
import { fullName } from '../../utils/utils';

/**
 * User's full name linking to their profile page.
 */
export function ClickableUserName({ userId }: { userId: number }): React.ReactElement | null {
  const { user } = useUser(userId);

  if (!user) return null;

  return (
    <Link href={`/${ROUTES.profile._}/${user.id}`}>
      {fullName(user)}
    </Link>
  );
}
