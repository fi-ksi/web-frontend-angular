/**
 * Convert an ISO date/time string from the backend (e.g. "2026-10-12T20:45:36")
 * to the value format a native `<input type="date">` expects ("2026-10-12").
 * Returns an empty string for missing values so the input stays empty.
 */
export function isoToDateInput(value: string | null | undefined): string {
  if (!value) {
    return '';
  }
  return value.split('T')[0];
}

/**
 * Convert an ISO date/time string to the value format a native
 * `<input type="datetime-local">` expects ("2026-10-12T20:45").
 */
export function isoToDatetimeLocal(value: string | null | undefined): string {
  if (!value) {
    return '';
  }
  const [date, time] = value.split('T');
  if (!time) {
    return date;
  }
  return `${date}T${time.slice(0, 5)}`;
}
