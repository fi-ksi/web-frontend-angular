import React from 'react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import type { components } from '../../api/schema';
import { TaskModuleQuiz } from './TaskModuleQuiz';

type S = components['schemas'];

const submitMock = vi.hoisted(() => vi.fn());

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key })
}));

vi.mock('./moduleSubmit', () => ({
  useModuleSubmit: () => ({
    status: null,
    submitting: false,
    submit: submitMock,
    clearStatus: vi.fn()
  }),
  subscribeModuleStatus: vi.fn(() => () => {}),
  publishModuleStatus: vi.fn()
}));

const moduleFixture: S['ModuleQuiz'] = {
  id: 42,
  type: 'quiz',
  name: 'Quiz',
  description: 'desc',
  autocorrect: true,
  max_score: 5,
  state: 'blank',
  score: null,
  questions: [
    {
      text: 'text q1',
      question: 'question q1',
      type: 'checkbox',
      options: ['opt a', 'opt b']
    },
    {
      text: 'text q2',
      question: 'question q2',
      type: 'radio',
      options: ['opt c', 'opt d']
    }
  ]
};

describe('TaskModuleQuiz', () => {
  beforeEach(() => {
    submitMock.mockClear();
  });

  it('renders all questions and options', () => {
    render(<TaskModuleQuiz module={moduleFixture} />);
    expect(screen.getByText('tasks.module.submit')).toBeInTheDocument();
    const inputs = screen.getAllByRole('checkbox');
    expect(inputs).toHaveLength(2);
    const radios = screen.getAllByRole('radio');
    expect(radios).toHaveLength(2);
  });

  it('submits checked option indexes grouped per question', () => {
    render(<TaskModuleQuiz module={moduleFixture} />);
    const checkboxes = screen.getAllByRole('checkbox') as HTMLInputElement[];
    fireEvent.click(checkboxes[0]);
    fireEvent.click(checkboxes[1]);
    const radios = screen.getAllByRole('radio') as HTMLInputElement[];
    fireEvent.click(radios[1]);

    fireEvent.click(screen.getByText('tasks.module.submit'));

    expect(submitMock).toHaveBeenCalledTimes(1);
    // checkbox question: both options checked -> ['0', '1']; radio: second -> ['1']
    expect(submitMock).toHaveBeenCalledWith([['0', '1'], ['1']]);
  });

  it('unchecks other options in a radio group', () => {
    render(<TaskModuleQuiz module={moduleFixture} />);
    const radios = screen.getAllByRole('radio') as HTMLInputElement[];
    fireEvent.click(radios[0]);
    fireEvent.click(radios[1]);

    fireEvent.click(screen.getByText('tasks.module.submit'));

    expect(submitMock).toHaveBeenCalledWith([[], ['1']]);
  });
});
