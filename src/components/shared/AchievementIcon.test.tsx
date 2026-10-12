// @vitest-environment jsdom
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, expect, it, vi } from 'vitest';
import { AchievementIcon } from './AchievementIcon';

vi.mock('next/link', () => ({
  default: ({ href, children, title }: { href: string; children: React.ReactNode; title?: string }) => (
    <a href={href} title={title}>
      {children}
    </a>
  )
}));

vi.mock('../../api/client', async (importOriginal) => {
  const mod = await importOriginal<typeof import('../../api/client')>();
  return {
    ...mod,
    achievementsGetSingle: vi.fn(async () => ({
      achievement: { id: 3, title: 'Úspěšný řešitel', picture: '/img/ach/successful.svg' }
    }))
  };
});

describe('AchievementIcon', () => {
  it('renders a linked icon with the achievement title as tooltip', async () => {
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    render(
      <QueryClientProvider client={client}>
        <AchievementIcon achievementId={3} />
      </QueryClientProvider>
    );
    await waitFor(() => expect(screen.getByRole('img')).toBeTruthy());
    const img = screen.getByRole('img') as HTMLImageElement;
    expect(img.alt).toBe('Úspěšný řešitel');
    expect(img.src).toContain('/img/ach/successful.svg');
    const link = screen.getByRole('link');
    expect(link.getAttribute('title')).toBe('Úspěšný řešitel');
  });
});
