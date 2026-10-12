import React, { useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../auth/AuthContext';
import './PageNotFound.scss';

interface PageNotFoundProps {
  /** Original path the user tried to reach, if known. */
  path?: string | null;
}

/**
 * 404 page. When the user is not logged in and logs in afterwards, they
 * are sent to the originally requested path (or the page reloads).
 */
export function PageNotFound({ path = null }: PageNotFoundProps): React.ReactElement {
  const { t } = useTranslation();
  const { isLoggedIn } = useAuth();
  const router = useRouter();
  const wasLoggedIn = useRef(isLoggedIn);

  useEffect(() => {
    if (!wasLoggedIn.current && isLoggedIn) {
      if (path) {
        router.push(path);
      } else {
        window.location.reload();
      }
    }
    wasLoggedIn.current = isLoggedIn;
  }, [isLoggedIn, path, router]);

  const host = typeof window === 'undefined' ? '' : `${window.location.protocol}//${window.location.host}`;

  return (
    <div className="page-not-found">
      <h1>{t('root.not-found.header')}</h1>
      <img src="/assets/img/karlik-404.svg" alt="" />
      {path && <Link href={path}>{host}{path}</Link>}
      <p>{t(`root.not-found.text.${isLoggedIn ? 'logged-in' : 'not-logged-in'}`)}</p>
    </div>
  );
}
