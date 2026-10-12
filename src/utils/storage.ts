const PREFIX = 'KSI';

function keyPath(scope: string, key: string): string {
  return `${PREFIX}/${scope}/${key}`;
}

function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

export function storageGet<T>(scope: string, key: string, defaultValue: T | null = null): T | null {
  if (!isBrowser()) return defaultValue;
  const item = localStorage.getItem(keyPath(scope, key));
  if (item === null) return defaultValue;
  try {
    return JSON.parse(item) as T;
  } catch {
    return defaultValue;
  }
}

export function storageSet<T>(scope: string, key: string, value: T): void {
  if (!isBrowser()) return;
  localStorage.setItem(keyPath(scope, key), JSON.stringify(value));
}

export function storageDelete(scope: string, key: string): void {
  if (!isBrowser()) return;
  localStorage.removeItem(keyPath(scope, key));
}
