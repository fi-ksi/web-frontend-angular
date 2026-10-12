import React from 'react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import '../../i18n';
import { PageAdminExec } from './PageAdminExec';
import type { components } from '../../api/schema';

type S = components['schemas'];

vi.mock('../../api/client', () => ({
  usersGetAll: vi.fn(),
  adminExecutionGetMultiple: vi.fn()
}));

import { adminExecutionGetMultiple, usersGetAll } from '../../api/client';

const mockUser: S['User'] = {
  id: 7,
  first_name: 'Ada',
  last_name: 'Lovelace',
  profile_picture: null,
  gender: 'female',
  email: 'ada@example.com',
  role: 'participant',
  score: 0,
  tasks_num: 0,
  achievements: [],
  enabled: true,
  nick_name: 'ada'
};

function renderPage() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <PageAdminExec />
    </QueryClientProvider>
  );
}

describe('PageAdminExec', () => {
  beforeEach(() => {
    vi.mocked(usersGetAll).mockResolvedValue({ users: [mockUser] });
    vi.mocked(adminExecutionGetMultiple).mockResolvedValue({ execs: [], meta: { total: 0, count: 0 } });
  });

  it('shows the notSelected error when submitting text that was not picked from the dropdown', async () => {
    renderPage();

    fireEvent.change(screen.getByLabelText('ID modulu'), { target: { value: '3' } });
    const userInput = screen.getByLabelText('Uživatel');
    fireEvent.change(userInput, { target: { value: 'some random text' } });
    fireEvent.click(screen.getByText('Hledat'));

    await waitFor(() => {
      expect(screen.getByText('Vyber uživatele z nabídky.')).toBeTruthy();
    });
    expect(adminExecutionGetMultiple).not.toHaveBeenCalled();
  });

  it('shows the required error when submitting with an empty user field', async () => {
    renderPage();

    fireEvent.change(screen.getByLabelText('ID modulu'), { target: { value: '3' } });
    fireEvent.click(screen.getByText('Hledat'));

    await waitFor(() => {
      expect(screen.getByText('Uživatel je povinný.')).toBeTruthy();
    });
  });

  it('resolves a picked dropdown user and searches executions with its id', async () => {
    renderPage();

    const userInput = screen.getByLabelText('Uživatel') as HTMLInputElement;
    fireEvent.change(userInput, { target: { value: 'Ada' } });
    await waitFor(() => {
      expect(screen.getByText('7 - Ada Lovelace')).toBeTruthy();
    });
    fireEvent.click(screen.getByText('7 - Ada Lovelace'));
    expect(userInput.value).toBe('7 - Ada Lovelace');

    fireEvent.change(screen.getByLabelText('ID modulu'), { target: { value: '3' } });
    fireEvent.click(screen.getByText('Hledat'));

    await waitFor(() => {
      expect(adminExecutionGetMultiple).toHaveBeenCalledWith(7, 3, 20, 0);
    });
  });
});
