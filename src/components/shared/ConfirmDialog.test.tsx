import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import '../../i18n';
import { ConfirmDialog } from './ConfirmDialog';

describe('ConfirmDialog', () => {
  it('renders nothing when closed', () => {
    const { container } = render(
      <ConfirmDialog open={false} onAnswer={() => {}} onClose={() => {}} />
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('reports true when the yes button is clicked', () => {
    const onAnswer = vi.fn();
    const onClose = vi.fn();
    render(<ConfirmDialog open={true} onAnswer={onAnswer} onClose={onClose} question="modal.yes-no.title" />);
    fireEvent.click(screen.getByText('Ano'));
    expect(onAnswer).toHaveBeenCalledWith(true);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('reports false when the no button is clicked', () => {
    const onAnswer = vi.fn();
    const onClose = vi.fn();
    render(<ConfirmDialog open={true} onAnswer={onAnswer} onClose={onClose} />);
    fireEvent.click(screen.getByText('Ne'));
    expect(onAnswer).toHaveBeenCalledWith(false);
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
