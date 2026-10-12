import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import Link from 'next/link';
import { threadsGetAll, wavesGetAll } from '../../api/client';
import { ROUTES } from '../../routes';
import { AdminWaveSelector } from './shared/AdminWaveSelector';

/**
 * Admin discussion overview: threads of the selected wave with post counts
 * and unread badges, linking to the public thread pages.
 */
export function PageAdminDiscussion(): React.ReactElement {
  const { t } = useTranslation();
  const [waveId, setWaveId] = useState<number | null>(null);

  const { data: waves } = useQuery({
    queryKey: ['waves'],
    queryFn: () => wavesGetAll().then((r) => r.waves)
  });

  const yearId = waveId !== null ? waves?.find((w) => w.id === waveId)?.year : undefined;

  const { data: threads } = useQuery({
    queryKey: ['threads', waveId, yearId],
    queryFn: () => threadsGetAll(waveId ?? undefined, yearId).then((r) => r.threads),
    enabled: waveId !== null
  });

  const threadHref = (id: number): string => `/${ROUTES.discussion}/${id}`;

  return (
    <div className="content">
      <h2 className="title">{t('admin.discussion.title')}</h2>

      <AdminWaveSelector value={waveId} onChange={setWaveId} allowAll={false} />

      <table className="table table-striped table-hover table-responsive-md threads">
        <thead>
          <tr>
            <th scope="col">{t('discussion.name')}</th>
            <th scope="col">{t('discussion.posts-count')}</th>
          </tr>
        </thead>
        <tbody>
          {(threads ?? []).map((thread) => (
            <tr key={thread.id}>
              <td>
                <Link href={threadHref(thread.id)} className={thread.unread ? 'has-unread' : undefined}>
                  {thread.title}
                </Link>
              </td>
              <td>
                <Link href={threadHref(thread.id)}>
                  {thread.posts_count}
                  {thread.unread > 0 && (
                    <span className="new-posts-count">
                      {' '}
                      ({thread.unread} {t(thread.unread === 1 ? 'new.single' : 'new.multiple')})
                    </span>
                  )}
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
