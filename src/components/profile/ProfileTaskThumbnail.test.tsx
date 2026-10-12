// @vitest-environment jsdom
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, expect, it, vi } from 'vitest';
import { ProfileTaskThumbnail } from './ProfileTaskThumbnail';

vi.mock('next/link', () => ({
  default: ({ href, children, className }: { href: string; children: React.ReactNode; className?: string }) => (
    <a href={href} className={className}>
      {children}
    </a>
  )
}));

vi.mock('../../api/client', async (importOriginal) => {
  const mod = await importOriginal<typeof import('../../api/client')>();
  return {
    ...mod,
    tasksGetSingle: vi.fn(async () => ({
      task: {
        id: 5,
        title: 'Testovací úloha',
        max_score: 10,
        picture_base: '/img/tasks',
        state: 'done',
        picture_suffix: '.svg'
      }
    }))
  };
});

function renderWithQuery(ui: React.ReactElement) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(<QueryClientProvider client={client}>{ui}</QueryClientProvider>);
}

describe('ProfileTaskThumbnail', () => {
  it('renders the task title, icon and score', async () => {
    renderWithQuery(<ProfileTaskThumbnail taskId={5} score={7} />);
    await waitFor(() => expect(screen.getByText('Testovací úloha')).toBeTruthy());
    expect(screen.getByText('7/10')).toBeTruthy();
    const link = screen.getByRole('link');
    expect(link.getAttribute('href')).toContain('/5');
  });

  it('renders a dash for an unpublished (null) score', async () => {
    renderWithQuery(<ProfileTaskThumbnail taskId={5} score={null} />);
    await waitFor(() => expect(screen.getByText('-/10')).toBeTruthy());
  });
});
