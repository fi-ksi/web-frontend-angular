import type { components } from '../api/schema';

type S = components['schemas'];

type RecursiveArray<T> = Array<T | RecursiveArray<T>>;

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3030/';

export function parseLegacyAssetsUrl(url: string): string {
  return url.startsWith('img/') ? `assets/${url}` : url;
}

export function substrHTML(html: string, start: number, length?: number): string {
  if (typeof document !== 'undefined') {
    const div = document.createElement('div');
    div.innerHTML = html;
    // textContent instead of innerText: identical tag-stripping, works in jsdom
    return (div.textContent ?? '').substring(start, length === undefined ? undefined : start + length);
  }
  return html.replace(/<[^>]*>/g, '').substring(start, length === undefined ? undefined : start + length);
}

export function getProfilePictureUrl(
  user: { profile_picture?: string | null; gender?: string },
  isOrg: boolean
): string {
  if (user.profile_picture) {
    const base = BACKEND_URL.endsWith('/') ? BACKEND_URL : `${BACKEND_URL}/`;
    return `${base}${user.profile_picture}`.replace(/([^:])\/{2,}/g, '$1/');
  }
  return `/assets/img/avatar/${isOrg ? 'org' : 'default'}${user.gender === 'male' ? '' : '-woman'}.svg`;
}

export function fullName(user: { first_name: string; last_name: string; nick_name?: string }): string {
  return `${user.first_name} ${user.nick_name ? `"${user.nick_name}" ` : ''}${user.last_name}`;
}

/**
 * Finds an element inside a multidimensional array
 */
export function deepContains<T>(array: RecursiveArray<T>, element: T): boolean {
  for (const x of array) {
    if ((Array.isArray(x) && deepContains(x, element)) || element === x) {
      return true;
    }
  }
  return false;
}

/**
 * Flattens a multidimensional array
 */
export function flatArray<T>(array: RecursiveArray<T>): T[] {
  const r: T[] = [];
  array.forEach((x) => {
    if (Array.isArray(x)) {
      r.push(...flatArray(x));
    } else {
      r.push(x);
    }
  });
  return r;
}

/**
 * Collapses duplicate slashes in a URL, keeping the protocol part intact
 */
export function fixUrl(url: string): string {
  const replace = (x: string): string => x.replace(/([^:])\/\//g, '$1/');
  return replace(replace(url));
}

/**
 * URL of the task state icon (locked/base/correcting/done)
 */
export function getTaskIconURL(task: Pick<S['Task'], 'picture_base' | 'state' | 'picture_suffix'>): string {
  const base = BACKEND_URL.endsWith('/') ? BACKEND_URL : `${BACKEND_URL}/`;
  return fixUrl(`${base}${task.picture_base}/${task.state}${task.picture_suffix}`);
}

/**
 * Temporarily hides a button (used while an async action is in flight).
 * If showAfter is set, the button is re-enabled after that many milliseconds.
 */
export function hideButton(button: HTMLButtonElement, showAfter?: number): void {
  button.disabled = true;
  const origOpacity = button.style.opacity;
  const origTransition = button.style.transition;
  button.style.transition = 'opacity 0.3s';
  button.style.opacity = '0';

  if (showAfter) {
    setTimeout(() => {
      button.disabled = false;
      button.style.opacity = origOpacity;
      setTimeout(() => {
        button.style.transition = origTransition;
      }, 300);
    }, showAfter);
  }
}

/**
 * Tests if the element is in a visible area of the app content.
 * If percentage is set, at most that percent of the element's height may be invisible.
 */
export function isElementVisible(element: HTMLElement, percentage?: number): boolean {
  const content = getAppContent();
  const elementRect = element.getBoundingClientRect();
  const contentRect = content.getBoundingClientRect();

  const contentViewTop = content.scrollTop + contentRect.top;
  const contentViewBottom = contentViewTop + contentRect.height;

  const invisibleTop = Math.max(contentViewTop - elementRect.top, 0);
  const invisibleBottom = Math.max(elementRect.bottom - contentViewBottom, 0);

  if (typeof percentage === 'undefined') {
    return invisibleTop + invisibleBottom < elementRect.height;
  }

  return ((invisibleTop + invisibleBottom) * 100) / elementRect.height <= percentage;
}

/**
 * The scrollable content area of the app (id must be set by the layout)
 */
export function getAppContent(): HTMLElement {
  const appContent = document.getElementById('ksi-app-page-content');
  if (!appContent) {
    throw new Error('Cannot find app content');
  }
  return appContent;
}
