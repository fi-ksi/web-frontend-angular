import { storageGet } from '../utils/storage';

/**
 * POSTs a JSON body with XMLHttpRequest so the upload progress can be
 * observed (fetch has no upload-progress support in browsers).
 * `onProgress` receives the fraction of the request body sent (0..1).
 */
export function postJsonWithProgress<T>(
  path: string,
  json: unknown,
  onProgress?: (fraction: number) => void
): Promise<T> {
  const base = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3030/';
  const url = base.replace(/\/$/, '') + path;
  return new Promise<T>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', url);
    xhr.setRequestHeader('Content-Type', 'application/json');
    const session = storageGet<{ access_token?: string }>('auth', 'session');
    if (session?.access_token) {
      xhr.setRequestHeader('Authorization', `Bearer ${session.access_token}`);
    }
    if (onProgress && xhr.upload) {
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable && event.total > 0) {
          onProgress(Math.min(1, event.loaded / event.total));
        }
      };
    }
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          resolve(JSON.parse(xhr.responseText) as T);
        } catch {
          resolve(xhr.responseText as unknown as T);
        }
      } else {
        const err = new Error(`HTTP ${xhr.status} ${url}`) as Error & { status: number };
        err.status = xhr.status;
        reject(err);
      }
    };
    xhr.onerror = () => reject(new Error(`Network error ${url}`));
    xhr.send(JSON.stringify(json));
  });
}
