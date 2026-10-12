import { deepContains, fixUrl, flatArray, getTaskIconURL, substrHTML } from './utils';
import { describe, expect, it } from 'vitest';

describe('deepContains', () => {
  it('finds elements in nested arrays', () => {
    expect(deepContains([1, [2, [3, 4]], 5], 3)).toBe(true);
    expect(deepContains([1, [2, [3, 4]], 5], 6)).toBe(false);
    expect(deepContains([], 1)).toBe(false);
  });
});

describe('flatArray', () => {
  it('flattens nested arrays', () => {
    expect(flatArray([1, [2, [3, 4]], 5])).toEqual([1, 2, 3, 4, 5]);
    expect(flatArray([])).toEqual([]);
  });
});

describe('fixUrl', () => {
  it('collapses duplicate slashes but keeps the protocol', () => {
    expect(fixUrl('http://localhost:3030//img//a.svg')).toBe('http://localhost:3030/img/a.svg');
    expect(fixUrl('https://x.io/a')).toBe('https://x.io/a');
  });
});

describe('getTaskIconURL', () => {
  it('builds the task state icon URL from the backend base', () => {
    const url = getTaskIconURL({ picture_base: 'img/task', state: 'done', picture_suffix: '.svg' });
    expect(url).toContain('/img/task/done.svg');
    expect(url).not.toContain('//img');
  });
});

describe('substrHTML', () => {
  it('strips tags and substrings the text', () => {
    expect(substrHTML('<p>Hello <b>world</b></p>', 0, 5)).toBe('Hello');
  });
});
