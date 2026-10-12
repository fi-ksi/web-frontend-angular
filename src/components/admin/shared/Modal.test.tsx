import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Modal } from './Modal';

describe('Modal', () => {
  it('renders nothing when show is false', () => {
    const { container } = render(
      <Modal show={false} title="Title" onClose={vi.fn()}>
        Body
      </Modal>
    );
    expect(container.innerHTML).toBe('');
  });

  it('renders title, body, custom footer and backdrop when shown', () => {
    render(
      <Modal show title="My title" onClose={vi.fn()} footer={<button type="button">Custom footer</button>}>
        <p>Body content</p>
      </Modal>
    );

    expect(screen.getByText('My title')).toBeTruthy();
    expect(screen.getByText('Body content')).toBeTruthy();
    expect(screen.getByText('Custom footer')).toBeTruthy();
    expect(document.querySelector('.modal-backdrop.show')).toBeTruthy();
    expect(document.querySelector('.modal.fade.show.d-block')).toBeTruthy();
  });

  it('calls onClose from the header close button and the default footer button', () => {
    const onClose = vi.fn();
    render(
      <Modal show title="Title" onClose={onClose}>
        Body
      </Modal>
    );

    fireEvent.click(screen.getByLabelText('Close', { selector: '.modal-header .close' }));
    expect(onClose).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByLabelText('Close', { selector: '.modal-footer .btn' }));
    expect(onClose).toHaveBeenCalledTimes(2);
  });

  it('calls onClose when the backdrop is clicked', () => {
    const onClose = vi.fn();
    render(
      <Modal show onClose={onClose}>
        Body
      </Modal>
    );

    const backdrop = document.querySelector('.modal-backdrop');
    expect(backdrop).toBeTruthy();
    fireEvent.click(backdrop as Element);
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
