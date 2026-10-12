import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { RichTextEditor } from './RichTextEditor';

vi.mock('react-quill-new', () => ({
  default: function MockQuill({
    value,
    onChange
  }: {
    value: string;
    onChange: (html: string) => void;
  }) {
    return (
      <textarea
        data-testid="mock-quill"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    );
  }
}));

describe('RichTextEditor', () => {
  it('renders the editor and forwards the HTML value', async () => {
    render(<RichTextEditor value="<p>ahoj</p>" onChange={() => {}} />);
    const editor = await screen.findByTestId('mock-quill');
    expect(editor).toHaveValue('<p>ahoj</p>');
  });

  it('reports edited HTML through onChange', async () => {
    const onChange = vi.fn();
    render(<RichTextEditor value="" onChange={onChange} />);
    const editor = await screen.findByTestId('mock-quill');
    fireEvent.change(editor, { target: { value: '<p>novy text</p>' } });
    expect(onChange).toHaveBeenCalledWith('<p>novy text</p>');
  });
});
