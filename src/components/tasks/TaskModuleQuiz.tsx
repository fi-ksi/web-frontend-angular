import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { components } from '../../api/schema';
import { TaskBody } from './TaskBody';
import { useModuleSubmit } from './moduleSubmit';
import './TaskModuleQuiz.scss';

type S = components['schemas'];

/**
 * Quiz module: radio/checkbox questions.
 * Port of the Angular TaskModuleQuizComponent.
 */
export function TaskModuleQuiz({ module }: { module: S['ModuleQuiz'] }): React.ReactElement {
  const { t } = useTranslation();
  const { submit, submitting } = useModuleSubmit(module.id);
  const [inputs, setInputs] = useState<boolean[][]>(() =>
    module.questions.map((question) => question.options.map(() => false))
  );

  const setChecked = (
    checked: boolean,
    type: S['ModuleQuiz']['questions'][number]['type'],
    questionGroup: number,
    optionIndex: number
  ): void => {
    setInputs((prev) =>
      prev.map((row, group) => {
        if (group !== questionGroup) {
          return row;
        }
        if (type === 'radio') {
          // radio buttons: uncheck everything else within the group
          return row.map((_, i) => i === optionIndex && checked);
        }
        return row.map((value, i) => (i === optionIndex ? checked : value));
      })
    );
  };

  const doSubmit = (): void => {
    const answers = inputs.map((row) =>
      row.map((checked, index) => (checked ? `${index}` : '')).filter((x) => !!x)
    );
    void submit(answers);
  };

  return (
    <div className="task-module-quiz">
      {module.questions.map((question, questionGroup) => (
        <div className="question" key={questionGroup}>
          <TaskBody body={question.text} />
          <TaskBody body={question.question} />
          <ul className="answers">
            {question.options.map((option, optionIndex) => {
              const inputId = `quiz-module-question-${module.id}-${questionGroup}-${optionIndex}`;
              return (
                <li key={optionIndex} className="answer">
                  <div className={`custom-control custom-${question.type}`}>
                    <input
                      id={inputId}
                      className="custom-control-input"
                      name={`quiz-module-question-${module.id}-${questionGroup}`}
                      type={question.type}
                      checked={inputs[questionGroup]?.[optionIndex] ?? false}
                      onChange={(event) =>
                        setChecked(event.target.checked, question.type, questionGroup, optionIndex)
                      }
                    />
                    <label className="custom-control-label" htmlFor={inputId}>
                      <TaskBody body={option} />
                    </label>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      ))}

      <button type="button" disabled={submitting} className="btn btn-ksi submit" onClick={doSubmit}>
        {t('tasks.module.submit')}
      </button>
    </div>
  );
}
