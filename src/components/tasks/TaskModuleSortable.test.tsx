import React from 'react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import type { components } from '../../api/schema';
import { TaskModuleSortable } from './TaskModuleSortable';

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

vi.mock('../../hooks/useWindowSize', () => ({
  useWindowSize: () => ({ width: 1200, height: 800 }),
  useIsMobileSmall: () => false
}));

const moduleFixture: S['ModuleSortable'] = {
  id: 7,
  type: 'sortable',
  name: 'Sortable',
  description: 'desc',
  autocorrect: true,
  max_score: 3,
  state: 'blank',
  score: null,
  sortable_list: {
    fixed: [{ content: 'fixed 1', offset: 0 }],
    movable: [
      { content: 'movable 1', offset: 0 },
      { content: 'movable 2', offset: 0 }
    ]
  }
};

describe('TaskModuleSortable', () => {
  beforeEach(() => {
    submitMock.mockClear();
  });

  it('renders the result list and the items list', () => {
    render(<TaskModuleSortable module={moduleFixture} />);
    expect(screen.getByText('tasks.module.sortable.result')).toBeInTheDocument();
    expect(screen.getByText('tasks.module.sortable.items')).toBeInTheDocument();
    expect(screen.getByText('fixed 1')).toBeInTheDocument();
    expect(screen.getByText('movable 1')).toBeInTheDocument();
    expect(screen.getByText('movable 2')).toBeInTheDocument();
  });

  it('moves a picked item from the items list to the result list', () => {
    render(<TaskModuleSortable module={moduleFixture} />);

    // pick "movable 1"
    fireEvent.click(screen.getByText('movable 1'));
    // a drop placeholder appears at the top of the result list; click it
    const places = document.querySelectorAll('.task-module-sortable-place .container');
    expect(places.length).toBeGreaterThan(0);
    fireEvent.click(places[0]);

    // "movable 1" is now in the result list, before the fixed item is not possible,
    // the result list shows it above the items list region
    const resultList = screen.getByText('tasks.module.sortable.result').parentElement!;
    expect(resultList.textContent).toContain('movable 1');
  });

  it('submits the $ids of the result list in order', () => {
    render(<TaskModuleSortable module={moduleFixture} />);

    fireEvent.click(screen.getByText('tasks.module.submit'));

    expect(submitMock).toHaveBeenCalledTimes(1);
    // only the fixed item a0 is in the result list initially
    expect(submitMock).toHaveBeenCalledWith(['a0']);
  });
});
