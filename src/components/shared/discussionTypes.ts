import type { components } from '../../api/schema';

type S = components['schemas'];

/**
 * The OpenAPI schema for Post predates the `resolved_at` column; the backend
 * returns it (see the hand-extended Angular API client). Extended locally
 * without touching src/api/*.
 */
export type DiscussionPost = S['Post'] & { resolved_at?: string | null };

export type PostsMap = Record<number, DiscussionPost>;

/** A post is resolved when the backend stamped it with a resolution time. */
export function isPostResolved(post: DiscussionPost | null | undefined): boolean {
  return !!post?.resolved_at;
}
