import React, { useState } from 'react';
import { TaskBody } from './TaskBody';
import './TaskCollapsible.scss';

interface TaskCollapsibleProps {
  title: string;
  content: string;
  trustedContent: boolean;
  initialOpen: boolean;
  collapsible: boolean;
}

/**
 * A collapsible panel inside task text. Port of the Angular
 * TaskCollapsibleComponent.
 */
export function TaskCollapsible({
  title,
  content,
  trustedContent,
  initialOpen,
  collapsible
}: TaskCollapsibleProps): React.ReactElement {
  const [open, setOpen] = useState(initialOpen);

  return (
    <div className="task-collapsible">
      <div className="content-dynamic card">
        <div className="card-header">
          <button
            type="button"
            className="btn btn-link heading"
            disabled={!collapsible}
            onClick={() => setOpen((value) => !value)}
            aria-expanded={open}
          >
            <TaskBody body={title} trusted={trustedContent} />
          </button>
        </div>
        {open && (
          <div className="card-body">
            <TaskBody body={content} trusted={trustedContent} />
          </div>
        )}
      </div>

      <div className="content-static">
        <div className="head">
          <TaskBody body={title} trusted={trustedContent} />
        </div>
        <div className="content">
          <TaskBody body={content} trusted={trustedContent} />
        </div>
      </div>
    </div>
  );
}
