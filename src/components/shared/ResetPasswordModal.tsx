import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { forgottenPasswordReset } from '../../api/client';
import { Modal } from './Modal';

interface ResetPasswordModalProps {
  open: boolean;
  onClose: () => void;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Forgotten-password dialog: sends a reset link to the given e-mail.
 */
export function ResetPasswordModal({ open, onClose }: ResetPasswordModalProps): React.ReactElement {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const resetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!EMAIL_RE.test(email) || submitting) return;
    setSubmitting(true);
    setDone(false);
    try {
      await forgottenPasswordReset({ email });
      setDone(true);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal open={open} title="modal.reset-password.title" onClose={onClose}>
      <form onSubmit={resetPassword}>
        <input
          type="email"
          className="form-control"
          placeholder={t('modal.login.email')}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        {done && (
          <div className="alert alert-info" role="alert">
            {t('modal.reset-password.done')}
          </div>
        )}

        <button disabled={!EMAIL_RE.test(email) || submitting} type="submit" className="btn btn-ksi w-100 btn-login">
          {t('modal.reset-password.submit')}
        </button>
      </form>
    </Modal>
  );
}
