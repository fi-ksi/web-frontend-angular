import React from 'react';
import { useTranslation } from 'react-i18next';
import { Modal } from './Modal';

interface ConfirmDialogProps {
  open: boolean;
  onAnswer: (answer: boolean) => void;
  onClose: () => void;
  question?: string;
  title?: string;
  yesLabel?: string;
  noLabel?: string;
}

/**
 * Port of the Angular modal-yes-no: asks a yes/no question and reports
 * the answer through onAnswer.
 */
export function ConfirmDialog({
  open,
  onAnswer,
  onClose,
  question,
  title = 'modal.yes-no.title',
  yesLabel = 'modal.yes-no.yes',
  noLabel = 'modal.yes-no.no'
}: ConfirmDialogProps): React.ReactElement {
  const { t } = useTranslation();

  const answer = (value: boolean) => {
    onAnswer(value);
    onClose();
  };

  return (
    <Modal open={open} title={title} onClose={onClose}>
      {question && <p className="question">{t(question)}</p>}
      <div className="controls d-flex justify-content-around">
        <button className="btn btn-ksi yes" onClick={() => answer(true)}>{t(yesLabel)}</button>
        <button className="btn btn-ksi no" onClick={() => answer(false)}>{t(noLabel)}</button>
      </div>
    </Modal>
  );
}
