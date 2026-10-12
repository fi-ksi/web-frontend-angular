import React from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { python } from '@codemirror/lang-python';
import './ExecReport.scss';

interface ExecReportProps {
  code: string;
  report: string;
}

/**
 * Read-only view of an execution: submitted code with Python highlighting
 * and the evaluator's text report below it.
 */
export function ExecReport({ code, report }: ExecReportProps): React.ReactElement {
  return (
    <>
      <div className="code-editor" style={{ marginBottom: '8px' }}>
        <CodeMirror value={code || ''} extensions={[python()]} readOnly={true} />
      </div>
      <textarea className="area-code-output" value={report || ''} readOnly={true} />
    </>
  );
}
