import React from 'react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import './PageForbidden.scss';

interface PageForbiddenProps {
  /** Path the user tried to reach without permission, if known. */
  path?: string | null;
}

/**
 * 403 page shown when the user lacks permission for a page.
 */
export function PageForbidden({ path = null }: PageForbiddenProps): React.ReactElement {
  const { t } = useTranslation();

  const host = typeof window === 'undefined' ? '' : `${window.location.protocol}//${window.location.host}`;

  return (
    <div className="page-forbidden">
      <h1>{t('root.forbidden.title')}</h1>
      <img src="/assets/img/forbidden.svg" alt="" />
      {path ? (
        <>
          <Link href={path}>{host}{path}</Link>
          <p>{t('root.forbidden.text')}</p>
        </>
      ) : (
        <p>{t('root.forbidden.easteregg')}</p>
      )}
    </div>
  );
}
