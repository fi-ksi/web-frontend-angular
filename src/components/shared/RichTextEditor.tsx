import React from 'react';
import dynamic from 'next/dynamic';
import type { default as ReactQuillComponent } from 'react-quill-new';
import './RichTextEditor.scss';

type ReactQuillProps = React.ComponentProps<typeof ReactQuillComponent>;

// Quill touches the DOM on import, so it is loaded client-side only.
const ReactQuill = dynamic<ReactQuillProps>(
  () => import('react-quill-new').then((m) => m.default),
  {
    ssr: false,
    loading: () => <div className="rich-text-editor-loading form-control" />
  }
);

const TOOLBAR_MODULES: ReactQuillProps['modules'] = {
  toolbar: [
    [{ header: [1, 2, 3, false] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ list: 'ordered' }, { list: 'bullet' }],
    ['link', 'image'],
    ['clean']
  ]
};

export interface RichTextEditorProps {
  /** Editor content as an HTML string, the same format the backend stores. */
  value: string;
  onChange: (html: string) => void;
  className?: string;
  placeholder?: string;
  readOnly?: boolean;
}

/**
 * Rich-text editor used everywhere the original application used Quill:
 * discussion replies, admin e-mail bodies, article bodies and achievement
 * descriptions. Values stay raw HTML strings.
 */
export function RichTextEditor({
  value,
  onChange,
  className,
  placeholder,
  readOnly = false
}: RichTextEditorProps): React.ReactElement {
  return (
    <div className={`rich-text-editor${className ? ` ${className}` : ''}`}>
      <ReactQuill
        theme="snow"
        value={value}
        onChange={(html) => onChange(html)}
        modules={TOOLBAR_MODULES}
        placeholder={placeholder}
        readOnly={readOnly}
      />
    </div>
  );
}
