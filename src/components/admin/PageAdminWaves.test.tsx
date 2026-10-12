import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { wavesDeleteSingle, wavesGetAll } from '../../api/client';
import '../../i18n';
import { PageAdminWaves } from './PageAdminWaves';

vi.mock('../../api/client', () => ({
  wavesGetAll: vi.fn(),
  wavesDeleteSingle: vi.fn()
}));

vi.mock('next/link', () => ({
  default: ({ href, children, className }: { href: string; children: React.ReactNode; className?: string }) => (
    // eslint-disable-next-line jsx-a11y/anchor-is-valid
    <a href={href} className={className}>
      {children}
    </a>
  )
}));

vi.mock('../shared/ClickableUserName', () => ({
  ClickableUserName: ({ userId }: { userId: number }) => <span data-testid="user">{userId}</span>
}));

vi.mock('../../hooks/useSelectedYear', () => ({
  useSelectedYear: () => ({ selectedYear: { id: 1 } })
}));

const WAVE_DELETABLE = {
  id: 1,
  index: 1,
  caption: 'Vlna jedna',
  garant: 5,
  time_published: '2999-01-01T00:00:00',
  year: 1,
  public: true,
  sum_points: 100,
  tasks_cnt: 0
};

const WAVE_RELEASED = {
  id: 2,
  index: 2,
  caption: 'Vlna dva',
  garant: 6,
  time_published: '2020-01-01T00:00:00',
  year: 1,
  public: true,
  sum_points: 50,
  tasks_cnt: 3
};

function renderPage(): void {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false, staleTime: Infinity } }
  });
  render(
    <QueryClientProvider client={client}>
      <PageAdminWaves />
    </QueryClientProvider>
  );
}

describe('PageAdminWaves', () => {
  beforeEach(() => {
    vi.mocked(wavesGetAll).mockResolvedValue({ waves: [WAVE_DELETABLE, WAVE_RELEASED] });
    vi.mocked(wavesDeleteSingle).mockResolvedValue({});
  });

  it('renders the waves table with totals', async () => {
    renderPage();

    expect(await screen.findByText('Vlna jedna')).toBeInTheDocument();
    expect(screen.getByText('Vlna dva')).toBeInTheDocument();
    // Totals row: 100 + 50 points, 0 + 3 tasks
    const rows = screen.getAllByRole('row');
    const totalRow = rows[rows.length - 1];
    expect(totalRow.textContent).toContain('150');
    expect(totalRow.textContent).toContain('3');
  });

  it('disables delete for a released wave with tasks', async () => {
    renderPage();
    await screen.findByText('Vlna dva');

    const deleteButtons = screen.getAllByTitle(/Nelze smazat/);
    expect(deleteButtons.length).toBeGreaterThan(0);
    deleteButtons.forEach((btn) => expect(btn).toBeDisabled());
  });

  it('asks for confirmation and deletes a deletable wave', async () => {
    renderPage();
    await screen.findByText('Vlna jedna');

    fireEvent.click(screen.getByTitle('Smazat'));
    expect(await screen.findByText('Opravdu chceš smazat tento záznam?')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Ano'));
    await waitFor(() => expect(wavesDeleteSingle).toHaveBeenCalledWith(1));
  });
});
