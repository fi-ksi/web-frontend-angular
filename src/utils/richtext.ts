/**
 * Helpers for working with the HTML produced by the Quill rich-text editor.
 * An untouched editor reports `<p><br></p>`, which has to count as empty.
 */

/** Removes markup from an editor value, keeping line breaks as whitespace. */
export function stripRichText(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(p|div|li|h[1-6]|tr)>/gi, '\n')
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&(amp|lt|gt|quot);/gi, (m) =>
      m === '&amp;' ? '&' : m === '&lt;' ? '<' : m === '&gt;' ? '>' : '"'
    )
    .trim();
}

/** True when the editor holds no visible text. */
export function isRichTextEmpty(html: string | null | undefined): boolean {
  if (html === null || html === undefined || html === '') {
    return true;
  }
  return stripRichText(html).length === 0;
}
