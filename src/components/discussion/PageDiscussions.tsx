import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { threadsGetAll, wavesGetAll } from '../../api/client';
import { useAuth } from '../../auth/AuthContext';
import { useLoginGate } from '../../auth/useLoginGate';
import { useSelectedYear } from '../../hooks/useSelectedYear';
import { useTranslation } from 'react-i18next';
import { ROUTES } from '../../routes';
import { PostReplyModal } from '../shared/PostReplyModal';
import { Spinner } from '../shared/Spinner';
import './PageDiscussions.scss';

/**
 * List of year-wide discussion threads with an optional wave filter.
 * Port of the Angular PageDiscussionsComponent; the wave filter mirrors the
 * admin discussion page, which is the only place Angular has one.
 */
export function PageDiscussions() {
  const { t } = useTranslation();
  const { isLoggedIn } = useAuth();
  const router = useRouter();
  const { selectedYear } = useSelectedYear();
  const [waveId, setWaveId] = useState<number | null>(null);
  const [newThreadOpen, setNewThreadOpen] = useState(false);
  const { requireLogin, loginGate } = useLoginGate();

  // Login-then-continue gate like the Angular version: the new-thread modal
  // opens only after the user is authenticated instead of failing on save.
  const openNewThread = () => {
    void requireLogin().then((ok) => {
      if (ok) {
        setNewThreadOpen(true);
      }
    });
  };

  const yearId = selectedYear?.id;

  const wavesQuery = useQuery({
    queryKey: ['waves', yearId],
    queryFn: () => wavesGetAll(yearId),
    enabled: yearId !== undefined
  });

  const threadsQuery = useQuery({
    queryKey: ['threads', yearId, waveId],
    queryFn: async () => {
      const resp = await threadsGetAll(waveId ?? undefined, yearId);
      return resp.threads;
    },
    enabled: yearId !== undefined
  });

  const waves = wavesQuery.data?.waves ?? [];

  return (
    <main className="page-discussions">
      <h2 className="title">{t('discussion.title')}</h2>

      <div className="controls">
        <a className="new-thread clickable" onClick={openNewThread}>
          {t('discussion.new')}
        </a>
        {waves.length > 0 && (
          <label className="wave-filter">
            {t('tasks.wave-selection.caption')}:{' '}
            <select
              className="form-control form-control-sm d-inline-block w-auto"
              value={waveId ?? ''}
              onChange={(e) => setWaveId(e.target.value === '' ? null : Number(e.target.value))}
            >
              <option value="">{t('tasks.wave-selection.all')}</option>
              {waves.map((wave) => (
                <option key={wave.id} value={wave.id}>
                  {wave.index + 1}. {t('waves.head.wave')}
                </option>
              ))}
            </select>
          </label>
        )}
      </div>

      {threadsQuery.isLoading ? (
        <Spinner />
      ) : (
        <table className="table table-striped table-hover table-responsive-md threads">
          <thead>
            <tr>
              <th scope="col">{t('discussion.name')}</th>
              <th scope="col">{t('discussion.posts-count')}</th>
            </tr>
          </thead>
          <tbody>
            {(threadsQuery.data ?? []).map((thread) => (
              <tr key={thread.id} className="clickable">
                <td>
                  <Link
                    href={`/${ROUTES.discussion}/${thread.id}`}
                    className={isLoggedIn && thread.unread ? 'has-unread' : undefined}
                  >
                    {thread.title}
                  </Link>
                </td>
                <td>
                  <Link href={`/${ROUTES.discussion}/${thread.id}`}>
                    {thread.posts_count}
                    {isLoggedIn && thread.unread > 0 && (
                      <span className="new-posts-count">
                        ({thread.unread} {t(thread.unread === 1 ? 'new.single' : 'new.multiple')})
                      </span>
                    )}
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <PostReplyModal
        show={newThreadOpen}
        mode="new-thread"
        threadId={null}
        yearId={yearId ?? null}
        onClose={() => setNewThreadOpen(false)}
        onSaved={(newThreadId) => router.push(`/${ROUTES.discussion}/${newThreadId}`)}
      />
      {loginGate}
    </main>
  );
}
