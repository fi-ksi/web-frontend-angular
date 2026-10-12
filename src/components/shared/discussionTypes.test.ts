import { describe, expect, it } from 'vitest';
import { isPostResolved, DiscussionPost } from './discussionTypes';

function makePost(overrides: Partial<DiscussionPost> = {}): DiscussionPost {
  return {
    id: 1,
    author: 2,
    body: '<p>body</p>',
    thread: 3,
    published_at: '2024-01-01T10:00:00',
    reaction: [],
    is_new: false,
    ...overrides
  };
}

describe('isPostResolved', () => {
  it('is true when the backend stamped resolved_at', () => {
    expect(isPostResolved(makePost({ resolved_at: '2024-01-02T12:00:00' }))).toBe(true);
  });

  it('is false when resolved_at is missing or null', () => {
    const { resolved_at: _omit, ...without } = makePost({ resolved_at: '2024-01-02T12:00:00' });
    expect(isPostResolved(without)).toBe(false);
    expect(isPostResolved(makePost({ resolved_at: null }))).toBe(false);
  });

  it('is false for null/undefined posts', () => {
    expect(isPostResolved(null)).toBe(false);
    expect(isPostResolved(undefined)).toBe(false);
  });
});
