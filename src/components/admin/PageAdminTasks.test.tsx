import React from 'react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import '../../i18n';
import { PageAdminTasks } from './PageAdminTasks';

vi.mock('../../api/client', () => ({
  adminTasksGetAll: vi.fn(),
  adminTaskDeploySingle: vi.fn(),
  adminTaskMergeSingle: vi.fn(),
  adminTasksGetDeploySingle: vi.fn(),
  wavesGetAll: vi.fn()
}));

vi.mock('../../auth/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 1, role: 'admin' },
    isLoggedIn: true,
    login: async () => true,
    logout: () => {},
    refreshUser: () => {}
  })
}));

import { adminTasksGetAll, wavesGetAll } from '../../api/client';

function renderPage() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <PageAdminTasks />
    </QueryClientProvider>
  );
}

describe('PageAdminTasks', () => {
  beforeEach(() => {
    vi.mocked(adminTasksGetAll).mockResolvedValue({ atasks: [] });
    vi.mocked(wavesGetAll).mockResolvedValue({ waves: [] });
  });

  it('renders the tasks table with headers and the wave selector', async () => {
    renderPage();

    expect(await screen.findByText('Správa úloh')).toBeTruthy();
    expect(screen.getByText('ID')).toBeTruthy();
    expect(screen.getByText('Název')).toBeTruthy();
    expect(screen.getByText('Autor')).toBeTruthy();
    expect(screen.getByText('Body')).toBeTruthy();
    expect(screen.getByText('Poslední nasazení')).toBeTruthy();
    expect(screen.getByText('Akce')).toBeTruthy();
    expect(screen.getByText('Stav')).toBeTruthy();
    expect(screen.getByText('Výběr zobrazených vln')).toBeTruthy();
  });

  it('groups tasks under their wave caption', async () => {
    vi.mocked(wavesGetAll).mockResolvedValue({
      waves: [
        {
          id: 5,
          index: 1,
          caption: 'Nultá vlna',
          garant: 1,
          time_published: null,
          year: 1,
          public: true,
          sum_points: 10,
          tasks_cnt: 1
        }
      ]
    });
    vi.mocked(adminTasksGetAll).mockResolvedValue({
      atasks: [
        {
          title: 'Test task',
          wave: 5,
          author: 1,
          git_path: 'x',
          git_branch: 'dev',
          id: 99,
          co_author: 2,
          git_commit: 'abc',
          deploy_date: '2026-10-01T10:00:00',
          deploy_status: 'done',
          max_score: 10,
          eval_comment: ''
        }
      ]
    });

    renderPage();

    const waveHeader = await screen.findByText('Test task');
    const waveRow = waveHeader.closest('tbody')!.querySelector('tr.wave .title');
    expect(waveRow?.textContent).toBe('Nultá vlna');
    expect(screen.getByText('Test task')).toBeTruthy();
    expect(screen.getByText('Merge')).toBeTruthy();
    expect(screen.getByText('Nasadit')).toBeTruthy();
  });
});
