import React, { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { threadDetailsGetSingle, threadsMarkVisited } from '../../api/client';
import { useAuth } from '../../auth/AuthContext';
import { useLoginGate } from '../../auth/useLoginGate';
import { useTranslation } from 'react-i18next';
import { useSelectedYear } from '../../hooks/useSelectedYear';
import { DiscussionPost, PostsMap } from './discussionTypes';
import { DiscussionThreadPosts } from './DiscussionThreadPosts';
import { PostReplyModal } from './PostReplyModal';
import { Spinner } from './Spinner';
import './DiscussionThread.scss';

interface DiscussionThreadProps {
  threadId: number;
  rootPost?: number | null;
  allowNewRootPosts?: boolean;
}

/** Max nested-post depth by viewport width, mirroring the Angular window service breakpoints. */
function useMaxPostsDepth(): number {
  const compute = () => {
    if (typeof window === 'undefined') {
      return 4;
    }
    if (window.innerWidth < 576) {
      return 1;
    }
    if (window.innerWidth < 768) {
      return 2;
    }
    return 4;
  };
  const [depth, setDepth] = useState<number>(compute);
  useEffect(() => {
    const onResize = () => setDepth(compute());
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return depth;
}

/**
 * Renders a whole discussion thread with nested posts. Port of the Angular
 * DiscussionThreadComponent; shared because the tasks module embeds threads
 * as well.
 */
export function DiscussionThread({
  threadId,
  rootPost = null,
  allowNewRootPosts = true
}: DiscussionThreadProps) {
  const { t } = useTranslation();
  const { isLoggedIn } = useAuth();
  const queryClient = useQueryClient();
  const maxDepth = useMaxPostsDepth();
  const { selectedYear } = useSelectedYear();
  const [newPostOpen, setNewPostOpen] = useState(false);
  const { requireLogin, loginGate } = useLoginGate();

  const threadQuery = useQuery({
    queryKey: ['thread-details', threadId],
    queryFn: () => threadDetailsGetSingle(threadId)
  });

  // mark the thread as visited when the user is logged in
  useEffect(() => {
    if (isLoggedIn) {
      void threadsMarkVisited(threadId);
    }
  }, [threadId, isLoggedIn]);

  const refresh = () => {
    void queryClient.invalidateQueries({ queryKey: ['thread-details', threadId] });
  };

  // Login-then-continue gate like the Angular version: the reply modal opens
  // only after the user is authenticated instead of failing on save.
  const openNewPost = () => {
    void requireLogin().then((ok) => {
      if (ok) {
        setNewPostOpen(true);
      }
    });
  };

  if (threadQuery.isLoading) {
    return <Spinner />;
  }
  if (threadQuery.isError || !threadQuery.data) {
    return null;
  }

  const posts: PostsMap = {};
  threadQuery.data.posts.forEach((post) => {
    posts[post.id] = post as DiscussionPost;
  });
  // The API contract carries root post ids in threadDetails, but some
  // backends only return the flat post list — derive the roots then.
  const threadDetails = threadQuery.data.threadDetails as
    | { root_posts?: number[] } | undefined;
  let rootIds = threadDetails?.root_posts;
  if (!rootIds) {
    const childIds = new Set<number>();
    threadQuery.data.posts.forEach((post) => {
      (post.reaction ?? []).forEach((id: number) => childIds.add(id));
    });
    rootIds = threadQuery.data.posts
      .map((post) => post.id)
      .filter((id) => !childIds.has(id));
  }
  const rootPosts = rootPost === null ? rootIds : [rootPost];

  return (
    <div className="discussion-thread">
      {rootPosts.map((postId) => (
        <DiscussionThreadPosts
          key={postId}
          postId={postId}
          posts={posts}
          threadId={threadId}
          maxLevel={maxDepth}
          onModified={refresh}
        />
      ))}
      {rootPost === null && allowNewRootPosts && (
        <button
          className="btn btn-ksi w-100 new-post"
          onClick={openNewPost}
        >
          {t('discussion-thread.post.new')}
        </button>
      )}
      {loginGate}
      <PostReplyModal
        show={newPostOpen}
        mode="reply"
        threadId={threadId}
        yearId={selectedYear?.id ?? null}
        onClose={() => setNewPostOpen(false)}
        onSaved={() => refresh()}
      />
    </div>
  );
}
