/**
 * Helpers for the errors thrown by src/api/client.ts
 * (an Error with an extra numeric `status` property).
 */

/**
 * Extracts the HTTP status code from an API error, if present
 */
export function getHttpStatus(error: unknown): number | undefined {
  if (error !== null && typeof error === 'object' && 'status' in error) {
    const status = (error as { status: unknown }).status;
    return typeof status === 'number' ? status : undefined;
  }
  return undefined;
}

/**
 * True when the error is an API error with one of the given HTTP statuses
 */
export function isHttpError(error: unknown, ...statuses: number[]): boolean {
  const status = getHttpStatus(error);
  return status !== undefined && statuses.includes(status);
}

/**
 * True for 401/403 API errors (session expired or insufficient rights)
 */
export function isAuthError(error: unknown): boolean {
  return isHttpError(error, 401, 403);
}
