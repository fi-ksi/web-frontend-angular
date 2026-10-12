import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { components } from '../../api/schema';
import { TaskBody } from './TaskBody';
import { useModuleSubmit } from './moduleSubmit';
import './TaskModuleText.scss';

type S = components['schemas'];

/**
 * Text-input module: one text field per question.
 * Port of the Angular TaskModuleTextComponent.
 */
export function TaskModuleText({ module }: { module: S['ModuleText'] }): React.ReactElement {
  const { t } = useTranslation();
  const { submit, submitting } = useModuleSubmit(module.id);
  const [inputs, setInputs] = useState<string[]>(() => module.fields.map(() => ''));

  const setInput = (index: number, value: string): void => {
    setInputs((prev) => prev.map((input, i) => (i === index ? value : input)));
  };

  return (
    <div className="task-module-text">
      {module.fields.map((question, index) => (
        <div className="question" key={index}>
          <label className="label">
            <TaskBody body={question} />
          </label>
          <input
            className="answer form-control"
            type="text"
            value={inputs[index]}
            onChange={(event) => setInput(index, event.target.value)}
          />
        </div>
      ))}

      <button
        type="button"
        disabled={submitting}
        className="btn btn-ksi submit"
        onClick={() => void submit(inputs)}
      >
        {t('tasks.module.submit')}
      </button>
    </div>
  );
}
