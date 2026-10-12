import React from 'react';
import { useTranslation } from 'react-i18next';
import { Modal } from './Modal';

/**
 * Generic server-error dialog.
 */
export function ServerErrorModal({ open, onClose }: { open: boolean; onClose: () => void }): React.ReactElement {
  const { t } = useTranslation();

  return (
    <Modal open={open} title="modal.server-error.title" onClose={onClose}>
      <div className="content text-center">
        <img src="/assets/img/server-error.svg" alt="" />
        <p>{t('modal.server-error.text')}</p>
      </div>
    </Modal>
  );
}
