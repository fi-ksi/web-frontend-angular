import React, { useCallback, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import CodeMirror from '@uiw/react-codemirror';
import { python } from '@codemirror/lang-python';
import { HighlightStyle, indentUnit, syntaxHighlighting } from '@codemirror/language';
import { indentWithTab } from '@codemirror/commands';
import { keymap } from '@codemirror/view';
import { tags } from '@lezer/highlight';
import { runCode } from '../../api/client';
import { analyzeCode, type EdulintReport } from '../../services/edulint';
import type { components } from '../../api/schema';
import { useAuth } from '../../auth/AuthContext';
import { ConfirmDialog } from '../shared/ConfirmDialog';
import { Spinner } from '../shared/Spinner';
import { isOrg } from '../../utils/format';
import { useModuleSubmit } from './moduleSubmit';
import './TaskModuleProgramming.scss';

type S = components['schemas'];

const ksiHighlightStyle = HighlightStyle.define([
  { tag: tags.number, color: 'var(--ksi-code-number)' },
  { tag: tags.keyword, color: 'var(--ksi-code-keyword)' },
  { tag: tags.bool, color: 'var(--ksi-code-keyword)' },
  { tag: tags.function(tags.definition(tags.variableName)), color: 'var(--ksi-code-def)' },
  { tag: tags.definition(tags.className), color: 'var(--ksi-code-def)' },
  { tag: tags.comment, color: 'var(--ksi-code-comment)' },
  { tag: tags.string, color: 'var(--ksi-code-string)' },
  { tag: tags.meta, color: 'var(--ksi-code-meta)' }
]);

const editorExtensions = [
  indentUnit.of('    '), // PEP-8 needs 4 spaces
  keymap.of([indentWithTab]), // tab keymap
  syntaxHighlighting(ksiHighlightStyle), // own colors for highlighting
  python() // support for python
];

/**
 * Programming module: Python code editor with run/submit/download/upload.
 * Port of the Angular TaskModuleProgrammingComponent, using
 * @uiw/react-codemirror with the Python language support.
 */
export function TaskModuleProgramming({ module }: { module: S['ModuleProgramming'] }): React.ReactElement {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { submit, submitting, progress, clearStatus } = useModuleSubmit(module.id);

  const [code, setCode] = useState(module.code || module.default_code);
  const [codeRunning, setCodeRunning] = useState(false);
  const [runResult, setRunResult] = useState<S['RunCodeResponse'] | null>(null);
  const [linting, setLinting] = useState(false);
  const [lintReport, setLintReport] = useState<EdulintReport | null>(null);
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false);
  const uploadFileRef = useRef<HTMLInputElement>(null);
  const runOutputRef = useRef<HTMLTextAreaElement>(null);
  const lintRequestRef = useRef(0);

  const doSubmit = useCallback(() => {
    setRunResult(null);
    setLintReport(null);
    void submit(code);
  }, [code, submit]);

  const doLint = useCallback(
    async (source: string) => {
      const requestId = ++lintRequestRef.current;
      setLinting(true);
      setLintReport(null);
      try {
        const report = await analyzeCode(source, module.edulint_source_id);
        if (lintRequestRef.current === requestId) {
          setLintReport(report);
        }
      } finally {
        if (lintRequestRef.current === requestId) {
          setLinting(false);
        }
      }
    },
    [module.edulint_source_id]
  );

  const doRunCode = useCallback(async () => {
    if (codeRunning) {
      return;
    }
    // hide the last submit result, the run output takes its place
    clearStatus();
    setLintReport(null);
    setCodeRunning(true);
    try {
      const result = await runCode({ content: code }, module.id);
      setRunResult(result);
      if (result.result === 'ok') {
        void doLint(code);
      }
      window.setTimeout(() => {
        runOutputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'nearest' });
      });
    } finally {
      setCodeRunning(false);
    }
  }, [codeRunning, clearStatus, code, module.id, doLint]);

  const download = useCallback(() => {
    const date = new Date();
    const moduleName = module.name
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/\s/g, '-')
      .toLowerCase();
    const el = document.createElement('a');
    el.setAttribute('href', `data:text/plain;charset=utf-8,${encodeURIComponent(code)}`);
    el.setAttribute(
      'download',
      `ksi_${moduleName}` +
        `_${date.getFullYear()}${date.getMonth() + 1}` +
        `${date.getDate()}_${date.getHours()}${date.getMinutes()}${date.getSeconds()}.py`
    );
    el.style.display = 'none';
    document.body.appendChild(el);
    el.click();
    document.body.removeChild(el);
  }, [code, module.name]);

  const replaceCode = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || !files.length) {
      return;
    }
    setCode(await files[0].text());
  }, []);

  return (
    <div className="task-module-programming">
      <CodeMirror
        value={code}
        className="code-editor"
        extensions={editorExtensions}
        onChange={(value) => setCode(value.replace(/\t/g, '    '))}
      />

      <div className="buttons">
        <button type="button" disabled={codeRunning} className="btn btn-ksi run" onClick={() => void doRunCode()}>
          {t('tasks.module.programming.run')}
        </button>
        <button type="button" disabled={submitting} className="btn btn-ksi submit" onClick={doSubmit}>
          {t('tasks.module.submit')}
        </button>
        <button type="button" className="btn btn-ksi download" onClick={download}>
          {t('tasks.module.programming.download')}
        </button>
        <button type="button" className="btn btn-ksi upload" onClick={() => uploadFileRef.current?.click()}>
          {t('tasks.module.programming.upload')}
        </button>
        <button type="button" className="btn btn-ksi reset" onClick={() => setResetConfirmOpen(true)}>
          {t('tasks.module.programming.reset')}
        </button>
      </div>

      <input ref={uploadFileRef} type="file" style={{ display: 'none' }} onChange={(e) => void replaceCode(e)} />

      {submitting && progress !== null && (
        <div className="progress submit-progress">
          <div
            className="progress-bar progress-bar-striped progress-bar-animated"
            role="progressbar"
            style={{ width: `${Math.round(progress * 100)}%` }}
            aria-valuenow={Math.round(progress * 100)}
            aria-valuemin={0}
            aria-valuemax={100}
          />
        </div>
      )}

      <ConfirmDialog
        open={resetConfirmOpen}
        onClose={() => setResetConfirmOpen(false)}
        onAnswer={(answer) => {
          if (answer) {
            setCode(module.default_code);
          }
        }}
        question="tasks.module.programming.reset-confirm"
      />

      {codeRunning && <Spinner />}

      {runResult && (
        <>
          {runResult.result === 'error' && (
            <div className="alert alert-danger report-heading">{runResult.message}</div>
          )}

          <h6 className="report-heading">{t('tasks.module.programming.run-result')}</h6>
          <textarea ref={runOutputRef} className="area-code-output" value={runResult.stdout || ''} readOnly />

          {linting && <Spinner />}

          {lintReport && (
            <>
              {lintReport.problems.length === 0 ? (
                <div className="alert alert-success lint-result">
                  {t('tasks.module.programming.lint.no-problems-found')}
                </div>
              ) : (
                <div className="alert alert-warning lint-result">
                  <div className="problems">
                    {t('tasks.module.programming.lint.problems-found', { count: lintReport.problems.length })}
                  </div>
                  <div>
                    <ul>
                      {lintReport.problems.map((problem, i) => (
                        <li key={i}>
                          <div className="problem">
                            line {problem.line}: {problem.text}
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <a
                      className="btn btn-ksi w-100"
                      href={lintReport.editorUrl}
                      target="_blank"
                      rel="noreferrer"
                      title={t('tasks.module.programming.lint.tooltip')}
                    >
                      {t('tasks.module.programming.lint.text')}
                    </a>
                  </div>
                </div>
              )}
            </>
          )}

          {isOrg(user?.role) && (
            <>
              <h6 className="report-heading">{t('tasks.module.report')}</h6>
              <textarea className="area-code-output" value={runResult.report || ''} readOnly />
            </>
          )}
        </>
      )}
    </div>
  );
}
