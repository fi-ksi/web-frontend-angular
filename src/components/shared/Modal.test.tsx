import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import '../../i18n';
import { Modal } from './Modal';

describe('Modal', () => {
  it('renders nothing when closed', () => {
    const { container } = render(
      <Modal open={false} title="modal.login.title" onClose={() => {}}>
        body
      </Modal>
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('renders title and children when open', () => {
    render(
      <Modal open={true} title="modal.login.title" onClose={() => {}}>
        <span>modal-body</span>
      </Modal>
    );
    expect(screen.getByText('modal-body')).toBeInTheDocument();
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('calls onClose when the backdrop is clicked', () => {
    const onClose = vi.fn();
    render(
      <Modal open={true} title="modal.login.title" onClose={onClose}>
        body
      </Modal>
    );
    fireEvent.click(screen.getByRole('dialog'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('does not close when the dialog content is clicked', () => {
    const onClose = vi.fn();
    render(
      <Modal open={true} title="modal.login.title" onClose={onClose}>
        <span>modal-body</span>
      </Modal>
    );
    fireEvent.click(screen.getByText('modal-body'));
    expect(onClose).not.toHaveBeenCalled();
  });

  it('calls onClose on Escape', () => {
    const onClose = vi.fn();
    render(
      <Modal open={true} title="modal.login.title" onClose={onClose}>
        body
      </Modal>
    );
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
