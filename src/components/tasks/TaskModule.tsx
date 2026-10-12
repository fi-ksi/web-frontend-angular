import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../auth/AuthContext';
import type { components } from '../../api/schema';
import { isOrg, isTester, translatePoints } from '../../utils/format';
import { TaskBody } from './TaskBody';
import { TaskModuleGeneral } from './TaskModuleGeneral';
import { TaskModuleProgramming } from './TaskModuleProgramming';
import { TaskModuleQuiz } from './TaskModuleQuiz';
import { TaskModuleSortable } from './TaskModuleSortable';
import { TaskModuleText } from './TaskModuleText';
import { useModuleSubmit } from './moduleSubmit';
import './TaskModule.scss';

type S = components['schemas'];

/**
 * One submit module of a task: header with points, description, the
 * module-specific form and the last submit result.
 * Port of the Angular TaskModuleComponent.
 */
export function TaskModule({ module }: { module: S['KSIModule'] }): React.ReactElement {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { status } = useModuleSubmit(module.id);
  const [unpacked, setUnpacked] = useState(false);

  // a solved module starts packed; a fresh "ok" submit packs it too,
  // the user can unpack it again manually
  const packed =
    !unpacked && (status ? status.result === 'ok' : module.state === 'correct' && module.autocorrect);

  const resultOk = status ? status.result === 'ok' : module.state === 'correct' && module.autocorrect;
  const resultBad = status ? status.result !== 'ok' : module.state === 'incorrect';

  const className = `task-module${resultOk ? ' result-ok' : ''}${resultBad ? ' result-bad' : ''}`;

  return (
    <div className={className}>
      <div className={`header${packed ? ' packed' : ''}`}>
        <span className="name">
          {resultOk && <span>✓</span>}
          {isTester(user?.role) && <span>({module.id})</span>}
          <TaskBody body={module.name} />
        </span>
        <span className={`points${resultOk ? ' font-weight-bold' : ''}`}>
          {translatePoints(t, module.max_score)}
          {packed && (
            <button type="button" className="btn btn-ksi unpack" onClick={() => setUnpacked(true)}>
              {t('tasks.module.unpack')}
            </button>
          )}
        </span>
      </div>

      {!packed && (
        <div className="content-container">
          <article className="description">
            <TaskBody body={module.description} />
          </article>

          <div className="content">
            {module.type === 'text' && <TaskModuleText module={module as S['ModuleText']} />}
            {module.type === 'quiz' && <TaskModuleQuiz module={module as S['ModuleQuiz']} />}
            {module.type === 'programming' && (
              <TaskModuleProgramming module={module as S['ModuleProgramming']} />
            )}
            {module.type === 'general' && <TaskModuleGeneral module={module as S['ModuleGeneral']} />}
            {module.type === 'sortable' && <TaskModuleSortable module={module as S['ModuleSortable']} />}
            {!['text', 'quiz', 'programming', 'general', 'sortable'].includes(module.type) && (
              <div className="alert alert-danger">ERR: Unknown module type: {module.type}</div>
            )}
          </div>

          {status && (
            <>
              <div
                className={`result alert alert-${status.result === 'ok' ? 'success' : 'danger'}`}
                style={{ whiteSpace: 'pre-line' }}
                dangerouslySetInnerHTML={{ __html: status.error || status.message || '' }}
              />
              {isOrg(user?.role) && (
                <>
                  <h6 className="report-heading">{t('tasks.module.report')}</h6>
                  <textarea className="area-code-output" value={status.report || ''} readOnly />
                </>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
