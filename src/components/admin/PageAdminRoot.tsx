import React from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../auth/AuthContext';
import { AdminSectionCard } from './AdminSectionCard';
import './PageAdminRoot.scss';

/** URL of the legacy frontend; its admin UI is linked from the admin landing page. */
const OLD_FRONTEND_URL = (process.env.NEXT_PUBLIC_OLD_FRONTEND_URL || 'https://kyzikos.fi.muni.cz/').replace(/\/$/, '');

/**
 * Admin landing page: section cards and a link to the legacy admin frontend.
 */
export function PageAdminRoot(): React.ReactElement {
  const { t } = useTranslation();
  const { user } = useAuth();

  return (
    <div className="content page-admin-root">
      <h2 className="title">{t('admin.root.title')}</h2>
      <div className="cards">
        <AdminSectionCard name="tasks" />
        <AdminSectionCard name="monitor" />
        <AdminSectionCard name="email" />
        <AdminSectionCard name="discussion" />
        {user?.role === 'admin' && <AdminSectionCard name="instance-config" />}
      </div>
      <a className="nav-btn" href={`${OLD_FRONTEND_URL}/admin/`} target="_blank" rel="noreferrer">
        {t('admin.root.old-frontend')}
      </a>
    </div>
  );
}
