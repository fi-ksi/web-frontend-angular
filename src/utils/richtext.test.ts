import { describe, expect, it } from 'vitest';
import { isRichTextEmpty, stripRichText } from './richtext';

describe('stripRichText', () => {
  it('returns plain text unchanged', () => {
    expect(stripRichText('hello')).toBe('hello');
  });

  it('removes tags and keeps the text', () => {
    expect(stripRichText('<p><strong>hello</strong> <em>world</em></p>')).toBe('hello world');
  });

  it('decodes common entities', () => {
    expect(stripRichText('<p>a&nbsp;&amp;&nbsp;b</p>')).toBe('a & b');
  });
});

describe('isRichTextEmpty', () => {
  it('treats missing values as empty', () => {
    expect(isRichTextEmpty(null)).toBe(true);
    expect(isRichTextEmpty(undefined)).toBe(true);
    expect(isRichTextEmpty('')).toBe(true);
  });

  it('treats a pristine Quill value as empty', () => {
    expect(isRichTextEmpty('<p><br></p>')).toBe(true);
  });

  it('treats whitespace-only markup as empty', () => {
    expect(isRichTextEmpty('<p>&nbsp;</p>')).toBe(true);
    expect(isRichTextEmpty('<p>   </p><p><br></p>')).toBe(true);
  });

  it('treats real content as non-empty', () => {
    expect(isRichTextEmpty('<p>hello</p>')).toBe(false);
    expect(isRichTextEmpty('<p><strong>x</strong></p>')).toBe(false);
  });
});
