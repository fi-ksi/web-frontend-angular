import { describe, expect, it } from 'vitest';
import { isoToDateInput, isoToDatetimeLocal } from './dateInput';

describe('isoToDateInput', () => {
  it('cuts the time part off an ISO datetime', () => {
    expect(isoToDateInput('2026-10-12T20:45:36')).toBe('2026-10-12');
  });

  it('leaves a plain date untouched', () => {
    expect(isoToDateInput('2026-10-12')).toBe('2026-10-12');
  });

  it('returns an empty string for missing values', () => {
    expect(isoToDateInput(null)).toBe('');
    expect(isoToDateInput(undefined)).toBe('');
    expect(isoToDateInput('')).toBe('');
  });
});

describe('isoToDatetimeLocal', () => {
  it('formats an ISO datetime for a datetime-local input', () => {
    expect(isoToDatetimeLocal('2026-10-12T20:45:36')).toBe('2026-10-12T20:45');
  });

  it('keeps a plain date as-is', () => {
    expect(isoToDatetimeLocal('2026-10-12')).toBe('2026-10-12');
  });

  it('returns an empty string for missing values', () => {
    expect(isoToDatetimeLocal(null)).toBe('');
    expect(isoToDatetimeLocal(undefined)).toBe('');
  });
});
