/**
 * Port of the Angular ksiDate pipe: formats an ISO date string in the Czech
 * locale, compensating the local timezone offset so stored UTC dates render
 * as calendar dates regardless of the viewer's timezone.
 */
export function formatKsiDate(value: string, format: 'short' | 'medium' = 'medium'): string {
  const valueDate = new Date(value);
  const offsetInHours = -valueDate.getTimezoneOffset() / 60;
  const correctTime = new Date(valueDate);
  correctTime.setHours(correctTime.getHours() + offsetInHours);
  return correctTime.toLocaleDateString(
    'cs-CZ',
    format === 'short' ? { day: 'numeric', month: 'numeric', year: 'numeric' } : { dateStyle: 'medium' }
  );
}
