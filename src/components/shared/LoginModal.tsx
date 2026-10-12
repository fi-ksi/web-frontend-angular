import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../auth/AuthContext';
import { Modal } from './Modal';

interface LoginModalProps {
  open: boolean;
  onClose: () => void;
  onOpenRegister: (email: string, password: string) => void;
  onOpenResetPassword: () => void;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Login dialog. On success it closes itself; wiring to the register and
 * forgotten-password dialogs goes through the navbar-provided callbacks.
 */
export function LoginModal({ open, onClose, onOpenRegister, onOpenResetPassword }: LoginModalProps): React.ReactElement {
  const { t } = useTranslation();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [failed, setFailed] = useState(false);

  const valid = EMAIL_RE.test(email) && password.length > 0 && !submitting;

  const doLogin = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!valid) return;
    setSubmitting(true);
    setFailed(false);
    try {
      const ok = await login(email, password);
      if (ok) {
        onClose();
      } else {
        setFailed(true);
      }
    } catch {
      setFailed(true);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal open={open} title="modal.login.title" onClose={onClose}>
      <form onSubmit={doLogin}>
        <input
          type="email"
          className="form-control"
          placeholder={t('modal.login.email')}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          className="form-control"
          placeholder={t('modal.login.password')}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {failed && (
          <div className="alert alert-danger" role="alert">
            {t('modal.login.failed')}
          </div>
        )}

        <button disabled={!valid} type="submit" className="btn btn-ksi w-100 btn-login">
          {t('modal.login.login')}
        </button>

        <div className="d-flex flex-column text-center">
          <a className="clickable" onClick={() => onOpenRegister(email, password)}>
            {t('modal.login.register')}
          </a>
          <a className="clickable" onClick={onOpenResetPassword}>
            {t('modal.login.forgotten-password')}
          </a>
        </div>
      </form>
    </Modal>
  );
}
