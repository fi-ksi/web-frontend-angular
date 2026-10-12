import React from 'react';
import { useTranslation } from 'react-i18next';
import { Modal } from './Modal';
import { TermsOfUse } from './TermsOfUse';

/**
 * Terms-of-use dialog shown from the registration form.
 */
export function TermsOfUseModal({ open, onClose }: { open: boolean; onClose: () => void }): React.ReactElement {
  const { t } = useTranslation();

  return (
    <Modal open={open} title="modal.tos.title" onClose={onClose} size="lg">
      <TermsOfUse />
      <button className="btn btn-ksi w-100" onClick={onClose}>
        {t('modal.tos.ok')}
      </button>
    </Modal>
  );
}
