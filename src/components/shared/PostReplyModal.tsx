import React, { useEffect, useState } from 'react';
import {
  postsCreateNew,
  postsEditSingle,
  threadsCreateNew
} from '../../api/client';
import { useTranslation } from 'react-i18next';
import { formatKsiDate } from '../../utils/date';
import { Modal } from './Modal';
import { RichTextEditor } from './RichTextEditor';
import { DiscussionPost, PostsMap } from './discussionTypes';
import { isRichTextEmpty } from '../../utils/richtext';
import './PostReplyModal.scss';

export type PostReplyMode = 'reply' | 'edit' | 'new-thread';

const THREAD_NAME_MAX_LENGTH = 100;
const REPLY_MAX_LENGTH = 8000;

interface PostReplyModalProps {
  show: boolean;
  mode: PostReplyMode;
  /** Null when creating a brand new thread. */
  threadId: number | null;
  /** The post being replied to, quoted in the modal (reply mode). */
  post?: DiscussionPost | null;
  /** Unused here; kept for API parity with the Angular modal (preview). */
  posts?: PostsMap | null;
  initialText?: string;
  /** Year the new thread belongs to (new-thread mode). */
  yearId?: number | null;
  /** Called after a successful save with the id of the thread holding the post. */
  onSaved: (threadId: number) => void;
  onClose: () => void;
}

/**
 * Port of the Angular ModalPostReplyComponent: creates new threads, replies
 * and edits posts. Bodies stay raw HTML like the backend stores them.
 */
export function PostReplyModal({
  show,
  mode,
  threadId,
  post = null,
  initialText = '',
  yearId = null,
  onSaved,
  onClose
}: PostReplyModalProps) {
  const { t } = useTranslation();
  const [threadName, setThreadName] = useState('');
  const [content, setContent] = useState(initialText);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (show) {
      setContent(initialText);
      setThreadName('');
      setSaving(false);
    }
  }, [show, initialText]);

  // Quill reports a pristine editor as `<p><br></p>`; only visible text counts.
  // The length limit applies to the HTML string, like the original validators.
  const contentValid = !isRichTextEmpty(content) && content.length <= REPLY_MAX_LENGTH;
  const nameValid = mode !== 'new-thread' ||
    (threadName.trim().length > 0 && threadName.length <= THREAD_NAME_MAX_LENGTH);
  const valid = contentValid && nameValid && !saving;

  const saveReply = async () => {
    if (!valid) {
      return;
    }
    setSaving(true);
    try {
      let targetThreadId = threadId;
      if (targetThreadId === null) {
        const resp = await threadsCreateNew({
          thread: { public: true, title: threadName.trim(), year: yearId! }
        });
        targetThreadId = resp.thread.id;
      }
      if (mode === 'edit' && post) {
        await postsEditSingle(
          { post: { author: post.author, body: content } },
          post.id
        );
      } else {
        await postsCreateNew({
          post: {
            thread: targetThreadId!,
            parent: post ? post.id : null,
            body: content
          }
        });
      }
      onSaved(targetThreadId!);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={show}
      title={`modal.post-reply.title.${mode}`}
      onClose={onClose}
      size="lg"
    >
      <form
        className="post-reply-form"
        onSubmit={(e) => {
          e.preventDefault();
          void saveReply();
        }}
      >
        {mode === 'new-thread' && (
          <input
            className="form-control thread-name"
            value={threadName}
            maxLength={THREAD_NAME_MAX_LENGTH}
            onChange={(e) => setThreadName(e.target.value)}
            placeholder={t('modal.post-reply.thread-name')}
          />
        )}
        {mode === 'reply' && post && (
          <div className="quoted-post">
            <div className="head">{formatKsiDate(post.published_at, 'short')}</div>
            <div className="content" dangerouslySetInnerHTML={{ __html: post.body }} />
          </div>
        )}
        <RichTextEditor
          className="reply-editor"
          value={content}
          onChange={setContent}
        />
        <div className={`post-size d-flex justify-content-end${content.length > REPLY_MAX_LENGTH ? ' text-danger' : ''}`}>
          <span>{t('modal.post-reply.total-size')}: {content.length} / {REPLY_MAX_LENGTH}</span>
        </div>
        <button type="submit" className="btn btn-ksi save-reply w-100" disabled={!valid}>
          {t('modal.post-reply.save-reply')}
        </button>
      </form>
    </Modal>
  );
}
