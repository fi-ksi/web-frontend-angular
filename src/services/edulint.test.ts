import { describe, expect, it } from 'vitest';
import {
  EDULINT_CONFIG,
  EDULINT_URL,
  mapEdulintResponse,
  withEdulintConfigComment
} from './edulint';

describe('withEdulintConfigComment', () => {
  it('appends the KSI edulint config directive', () => {
    const out = withEdulintConfigComment('print(1)');
    expect(out).toBe(`print(1)\n# edulint: config=${EDULINT_CONFIG}\n`);
  });
});

describe('mapEdulintResponse', () => {
  it('builds the editor URL from the hash', () => {
    const report = mapEdulintResponse('abc123', {});
    expect(report.editorUrl).toBe(`${EDULINT_URL}/editor/abc123`);
    expect(report.problems).toEqual([]);
  });

  it('defaults missing problems to an empty list', () => {
    const report = mapEdulintResponse('h', { problems: undefined });
    expect(report.problems).toEqual([]);
  });

  it('keeps the reported problems', () => {
    const problems = [
      { line: 3, text: 'missing docstring' },
      { line: 7, text: 'unused variable' }
    ];
    const report = mapEdulintResponse('h', { problems });
    expect(report.problems).toHaveLength(2);
    expect(report.problems[0]).toMatchObject({ line: 3, text: 'missing docstring' });
  });
});
