import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { adminMonitoringDashboardURL } from '../../api/client';

/**
 * Admin monitoring page: embeds the external monitoring dashboard in an
 * iframe and offers a link opening it in a new tab.
 */
export function PageAdminMonitor(): React.ReactElement {
  const { t } = useTranslation();
  const { data: url } = useQuery({
    queryKey: ['adminMonitoringDashboardURL'],
    queryFn: () => adminMonitoringDashboardURL().then((r) => r.url)
  });

  return (
    <div className="content page-admin-monitor">
      <a className="link" href={url} target="_blank" rel="noreferrer">
        {t('admin.monitor.new-window')}
      </a>
      {url && <iframe className="frame" title={t('admin.root.monitor.title')} src={url} />}
    </div>
  );
}
