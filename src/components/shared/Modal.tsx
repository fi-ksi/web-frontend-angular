import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

interface ModalProps {
  open: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  size?: 'sm' | 'lg' | 'xl';
}

/**
 * Minimal Bootstrap modal. The parent controls visibility with local state,
 * replacing the Angular ModalService + ngx-bootstrap plumbing.
 */
export function Modal({ open, title, onClose, children, size }: ModalProps): React.ReactElement | null {
  const { t } = useTranslation();

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="modal show d-block"
      tabIndex={-1}
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className={`modal-dialog modal-dialog-centered${size ? ` modal-${size}` : ''}`}
        role="document"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-content">
          <div className="modal-header">
            <h4 className="modal-title">{t(title)}</h4>
            <button type="button" className="btn-close close pull-right" aria-label="Close" onClick={onClose}>
              <span aria-hidden="true" className="visually-hidden">&times;</span>
            </button>
          </div>
          <div className="modal-body">{children}</div>
        </div>
      </div>
    </div>
  );
}
