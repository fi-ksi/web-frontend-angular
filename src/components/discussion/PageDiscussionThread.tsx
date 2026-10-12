import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { threadsGetSingle } from '../../api/client';
import { useTranslation } from 'react-i18next';
import { ROUTES } from '../../routes';
import { DiscussionThread } from '../shared/DiscussionThread';
import { Spinner } from '../shared/Spinner';
import './PageDiscussionThread.scss';

/**
 * Detail of a single discussion thread. Port of the Angular
 * PageDiscussionThreadComponent. A URL hash (`#<postId>`) shows only the
 * subtree rooted at that post, like the Angular route fragment did.
 */
export function PageDiscussionThread() {
  const { t } = useTranslation();
  const params = useParams();
  const threadId = Number(params.threadId);

  const [rootPost, setRootPost] = useState<number | null>(null);
  useEffect(() => {
    const readHash = () => {
      const hash = window.location.hash.replace(/^#/, '');
      setRootPost(hash !== '' && !isNaN(Number(hash)) ? Number(hash) : null);
    };
    readHash();
    window.addEventListener('hashchange', readHash);
    return () => window.removeEventListener('hashchange', readHash);
  }, []);

  const threadQuery = useQuery({
    queryKey: ['thread', threadId],
    queryFn: () => threadsGetSingle(threadId),
    enabled: !isNaN(threadId)
  });

  return (
    <main className="page-discussion-thread">
      {threadQuery.isLoading ? (
        <Spinner />
      ) : (
        <>
          <h2 className="title">{threadQuery.data?.thread.title}</h2>
          {rootPost !== null && (
            <Link className="full-discussion clickable" href={`/${ROUTES.discussion}/${threadId}`}>
              ❮ {t('discussion.show-full')}
            </Link>
          )}
          {!isNaN(threadId) && (
            <DiscussionThread threadId={threadId} rootPost={rootPost} />
          )}
        </>
      )}
    </main>
  );
}
