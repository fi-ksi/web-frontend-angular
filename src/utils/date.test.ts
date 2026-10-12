import { describe, expect, it } from 'vitest';
import { formatKsiDate } from './date';

describe('formatKsiDate', () => {
  it('formats a date in the Czech locale', () => {
    const out = formatKsiDate('2026-10-12T00:00:00Z');
    expect(out).toMatch(/12\.\s*10\.\s*2026/);
  });

  it('supports the short variant', () => {
    const out = formatKsiDate('2026-01-05T00:00:00Z', 'short');
    expect(out).toMatch(/5\.\s*1\.\s*2026/);
  });
});
