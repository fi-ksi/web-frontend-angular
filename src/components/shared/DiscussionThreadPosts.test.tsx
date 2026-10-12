import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import '../../i18n';
import { DiscussionThreadPosts } from './DiscussionThreadPosts';
import { DiscussionPost, PostsMap } from './discussionTypes';

vi.mock('next/link', () => ({
  default: ({ href, children, className, title, onClick }: {
    href: string; children: React.ReactNode; className?: string; title?: string;
    onClick?: (e: React.MouseEvent) => void;
  }) => <a href={href} className={className} title={title} onClick={onClick}>{children}</a>
}));

const orgUser = { id: 99, role: 'org', first_name: 'Org', last_name: 'Anizátor', gender: 'male' };
const participantUser = { id: 100, role: 'participant', first_name: 'Par', last_name: 'Ticipant', gender: 'male' };
let currentUser: typeof orgUser = orgUser;

vi.mock('../../auth/AuthContext', () => ({
  useAuth: () => ({ user: currentUser, isLoggedIn: true, login: vi.fn(), logout: vi.fn(), refreshUser: vi.fn() })
}));

vi.mock('../../hooks/useUsers', () => ({
  useUser: () => ({
    user: {
      id: 1, first_name: 'Karel', nick_name: null, last_name: 'Novák',
      role: 'participant', gender: 'male', profile_picture: '/assets/img/avatar/default.svg'
    },
    isLoading: false
  })
}));

const { postsResolve, postsUnresolve } = vi.hoisted(() => ({
  postsResolve: vi.fn(),
  postsUnresolve: vi.fn()
}));
vi.mock('../../api/client', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../../api/client')>()),
  postsResolve,
  postsUnresolve
}));

function makePost(overrides: Partial<DiscussionPost> = {}): DiscussionPost {
  return {
    id: 1,
    author: 1,
    body: '<p>hello</p>',
    thread: 5,
    published_at: '2024-01-01T10:00:00',
    reaction: [],
    is_new: false,
    ...overrides
  };
}

function renderPosts(posts: PostsMap, onModified = vi.fn()) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } }
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <DiscussionThreadPosts postId={1} posts={posts} threadId={5} onModified={onModified} />
    </QueryClientProvider>
  );
}

describe('DiscussionThreadPosts resolved state', () => {
  beforeEach(() => {
    currentUser = orgUser;
    postsResolve.mockReset();
    postsUnresolve.mockReset();
    window.localStorage.clear();
  });

  it('shows the "Vyřešeno" badge on a resolved post only', () => {
    const { rerender } = renderPosts({ 1: makePost({ resolved_at: '2024-01-02T12:00:00' }) });
    expect(screen.getByText(/Vyřešeno/)).toBeInTheDocument();

    rerender(
      <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
        <DiscussionThreadPosts postId={1} posts={{ 1: makePost({ resolved_at: null }) }} threadId={5} />
      </QueryClientProvider>
    );
    expect(screen.queryByText(/Vyřešeno/)).not.toBeInTheDocument();
  });

  it('org sees "Znovu otevřít" on a resolved post and calls postsUnresolve', async () => {
    const onModified = vi.fn();
    postsUnresolve.mockResolvedValue({ post: { resolved_at: null } });
    renderPosts({ 1: makePost({ resolved_at: '2024-01-02T12:00:00' }) }, onModified);

    const toggle = screen.getByText('Znovu otevřít');
    fireEvent.click(toggle);
    await waitFor(() => expect(postsUnresolve).toHaveBeenCalledWith(1));
    expect(onModified).toHaveBeenCalled();
  });

  it('org sees "Vyřešit" on an unresolved post and calls postsResolve', async () => {
    postsResolve.mockResolvedValue({ post: { resolved_at: '2026-10-12T12:00:00' } });
    renderPosts({ 1: makePost({ resolved_at: null }) });

    const toggle = screen.getByText('Vyřešit');
    fireEvent.click(toggle);
    await waitFor(() => expect(postsResolve).toHaveBeenCalledWith(1));
  });

  it('non-org users do not see the resolve toggle', () => {
    currentUser = participantUser;
    renderPosts({ 1: makePost({ resolved_at: null }) });

    expect(screen.queryByText('Vyřešit')).not.toBeInTheDocument();
    expect(screen.queryByText('Znovu otevřít')).not.toBeInTheDocument();
  });
});
