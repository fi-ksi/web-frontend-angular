import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useQueryClient } from '@tanstack/react-query';
import {
  postsDeleteSingle,
  postsResolve,
  postsUnresolve
} from '../../api/client';
import type { components } from '../../api/schema';
import { useAuth } from '../../auth/AuthContext';
import { useLoginGate } from '../../auth/useLoginGate';
import { useUser } from '../../hooks/useUsers';
import { useTranslation } from 'react-i18next';
import { ROUTES } from '../../routes';
import { formatKsiDate } from '../../utils/date';
import { fullName } from '../../utils/utils';
import { storageGet, storageSet } from '../../utils/storage';
import { ConfirmDialog } from './ConfirmDialog';
import { DiscussionPost, PostsMap, isPostResolved } from './discussionTypes';
import { PostReplyModal, PostReplyMode } from './PostReplyModal';
import './DiscussionThreadPosts.scss';

type S = components['schemas'];

interface DiscussionThreadPostsProps {
  postId: number;
  posts: PostsMap;
  threadId: number | null;
  level?: number;
  maxLevel?: number | null;
  parent?: DiscussionPost | null;
  allowActions?: boolean;
  allowExpansion?: boolean;
  onModified?: () => void;
}

function PostAuthor({ authorId }: { authorId: number }) {
  const { t } = useTranslation();
  const { user } = useUser(authorId);
  if (!user) {
    return null;
  }
  return (
    <span className="user">
      <Link href={`/${ROUTES.profile._}/${user.id}`}>
        <img className="pic" src={user.profile_picture} alt="" />
        <span className="name">{fullName(user)}</span>
      </Link>
      <span className="role"> - {t(`user.role.${user.role}.${user.gender}`)}</span>
    </span>
  );
}

/**
 * Renders one discussion post with its footer actions and recursively its
 * replies. Port of the Angular DiscussionThreadPostsComponent, including the
 * resolved badge and the org-only resolve/reopen toggle.
 */
export function DiscussionThreadPosts({
  postId,
  posts,
  threadId,
  level = 0,
  maxLevel = null,
  parent = null,
  allowActions = true,
  allowExpansion = true,
  onModified
}: DiscussionThreadPostsProps) {
  const { t } = useTranslation();
  const { user: currentUser } = useAuth();
  const queryClient = useQueryClient();

  const [post, setPost] = useState<DiscussionPost | undefined>(posts[postId]);
  useEffect(() => {
    setPost(posts[postId]);
  }, [posts, postId]);

  const [expanded, setExpanded] = useState<boolean>(() =>
    storageGet<boolean>('discussion', `post/${postId}/expanded`, true) ?? true
  );

  const [replyModal, setReplyModal] = useState<{ show: boolean; mode: PostReplyMode; text: string }>(
    { show: false, mode: 'reply', text: '' }
  );
  const [confirmDelete, setConfirmDelete] = useState(false);
  const { requireLogin, loginGate } = useLoginGate();

  // Login-then-continue gate like the Angular version: the reply/edit modal
  // opens only after the user is authenticated instead of failing on save.
  const openReplyModal = (mode: PostReplyMode, text: string) => {
    void requireLogin().then((ok) => {
      if (ok) {
        setReplyModal({ show: true, mode, text });
      }
    });
  };

  if (!post) {
    return null;
  }

  const isOrg = currentUser?.role === 'admin' || currentUser?.role === 'org';
  const isAuthor = !!currentUser && currentUser.id === post.author;
  const canEdit = isOrg || isAuthor;
  const reactions: number[] = post.reaction ?? [];
  const canDelete = canEdit && reactions.length === 0;
  const resolved = isPostResolved(post);
  const maxLevelReached = maxLevel !== null && level >= maxLevel;
  const childrenVisible = expanded && (maxLevel === null || level < maxLevel);

  const changeExpanded = (value: boolean) => {
    setExpanded(value);
    storageSet('discussion', `post/${postId}/expanded`, value);
  };

  const invalidateThreads = () => {
    void queryClient.invalidateQueries({ queryKey: ['thread-details'] });
    void queryClient.invalidateQueries({ queryKey: ['threads'] });
  };

  const toggleResolved = async () => {
    const resp = resolved
      ? await postsUnresolve(postId)
      : await postsResolve(postId);
    const resolvedAt = (resp.post as S['Post'] & { resolved_at?: string | null }).resolved_at ?? null;
    setPost({ ...post, resolved_at: resolvedAt });
    invalidateThreads();
    onModified?.();
  };

  const deletePost = async () => {
    await postsDeleteSingle(postId);
    invalidateThreads();
    onModified?.();
  };

  const threadUrl = threadId !== null ? `/${ROUTES.discussion}/${threadId}` : null;

  return (
    <>
      <div className="discussion-thread-post">
        <div className="post">
          <div className="head">
            <PostAuthor authorId={post.author} />, {formatKsiDate(post.published_at, 'short')}
            {resolved && (
              <span className="resolved-badge" title={t('discussion-thread.post.resolved')}>
                ✓ {t('discussion-thread.post.resolved')}
              </span>
            )}
          </div>
          <div className="content" dangerouslySetInnerHTML={{ __html: post.body }} />
          {allowActions && (
            <div className="footer">
              {isOrg && (
                <a
                  className="resolve clickable"
                  title={t(resolved
                    ? 'discussion-thread.post.unresolve.tooltip'
                    : 'discussion-thread.post.resolve.tooltip')}
                  onClick={() => void toggleResolved()}
                >
                  {t(resolved
                    ? 'discussion-thread.post.unresolve.title'
                    : 'discussion-thread.post.resolve.title')}
                </a>
              )}
              {canEdit && (
                <a
                  className="edit clickable"
                  title={t('discussion-thread.post.edit.tooltip')}
                  onClick={() => openReplyModal('edit', post.body)}
                >
                  {t('discussion-thread.post.edit.title')}
                </a>
              )}
              <a
                className="reply clickable"
                title={t('discussion-thread.post.reply.tooltip')}
                onClick={() => openReplyModal('reply', '')}
              >
                {t('discussion-thread.post.reply.title')}
              </a>
              {canDelete && (
                <a
                  className="delete clickable"
                  title={t('discussion-thread.post.delete.tooltip')}
                  onClick={() => setConfirmDelete(true)}
                >
                  {t('discussion-thread.post.delete.title')}
                </a>
              )}
              {threadId !== null && (
                <Link
                  className="link"
                  href={`${threadUrl}#${post.id}`}
                  title={t('discussion-thread.post.link')}
                >
                  #
                </Link>
              )}
            </div>
          )}
        </div>

        {reactions.length > 0 && (
          <>
            {childrenVisible ? (
              <div className="children-container">
                <div className="line-container">
                  <div className="line" onClick={() => changeExpanded(false)} />
                </div>
                <div className="children">
                  {reactions.map((childId) => (
                    <DiscussionThreadPosts
                      key={childId}
                      postId={childId}
                      posts={posts}
                      parent={post}
                      threadId={threadId}
                      level={level + 1}
                      maxLevel={maxLevel}
                      allowExpansion={allowExpansion}
                      allowActions={allowActions}
                      onModified={onModified}
                    />
                  ))}
                </div>
              </div>
            ) : (
              allowExpansion && (
                <Link
                  className="expand"
                  href={threadUrl && maxLevelReached ? `${threadUrl}#${post.id}` : (threadUrl ?? '#')}
                  onClick={(e) => {
                    if (!maxLevelReached) {
                      e.preventDefault();
                      changeExpanded(true);
                    }
                  }}
                >
                  <span className="icon">ᐁ</span>
                  <span className="text">{t('discussion-thread.post.expand')}</span>
                </Link>
              )
            )}
          </>
        )}
      </div>

      <PostReplyModal
        show={replyModal.show}
        mode={replyModal.mode}
        threadId={threadId}
        post={post}
        posts={posts}
        initialText={replyModal.text}
        onClose={() => setReplyModal((m) => ({ ...m, show: false }))}
        onSaved={() => {
          invalidateThreads();
          onModified?.();
        }}
      />
      {loginGate}
      <ConfirmDialog
        open={confirmDelete}
        question="discussion-thread.post.delete.confirmation"
        onAnswer={(yes) => { if (yes) void deletePost(); }}
        onClose={() => setConfirmDelete(false)}
      />
    </>
  );
}
