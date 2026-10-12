import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../auth/AuthContext';
import { sendEmailWithFeedback } from '../../api/client';
import { Modal } from './Modal';

interface FeedbackModalProps {
  open: boolean;
  onClose: () => void;
}

/**
 * "Send us feedback" dialog (POST /feedback).
 */
export function FeedbackModal({ open, onClose }: FeedbackModalProps): React.ReactElement {
  const { t } = useTranslation();
  const { user } = useAuth();

  const [email, setEmail] = useState('');
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (open) {
      setEmail(user?.email ?? '');
      setContent('');
      setDone(false);
    }
  }, [open, user?.email]);

  const valid = content.trim() !== '' && !submitting;

  const sendFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!valid) return;
    setSubmitting(true);
    setDone(false);
    try {
      await sendEmailWithFeedback({ email, body: content });
      setDone(true);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal open={open} title="modal.feedback.title" onClose={onClose}>
      <p dangerouslySetInnerHTML={{ __html: t('modal.feedback.text') }} />

      <form onSubmit={sendFeedback}>
        <label htmlFor="feedback-email" className="form-label">{t('modal.feedback.email')}</label>
        <input
          id="feedback-email"
          type="email"
          className="form-control"
          placeholder={t('modal.feedback.email')}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <textarea
          className="form-control"
          rows={5}
          placeholder={t('modal.feedback.content')}
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />

        {done && (
          <div className="alert alert-info" role="alert">
            {t('modal.feedback.done')}
          </div>
        )}

        <button disabled={!valid} type="submit" className="btn btn-ksi w-100 btn-login">
          {t('modal.feedback.submit')}
        </button>
      </form>
    </Modal>
  );
}
