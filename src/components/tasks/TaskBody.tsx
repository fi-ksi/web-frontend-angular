import React, { useEffect, useRef } from 'react';
import hljs from 'highlight.js';
import 'mathjax/es5/tex-svg';
import { createRoot, type Root } from 'react-dom/client';
import { TaskCollapsible } from './TaskCollapsible';
import { TaskTip } from './TaskTip';
import './TaskBody.scss';

declare global {
  interface Window {
    MathJax: { tex2svg: (tex: string, options?: object) => HTMLElement };
  }
}

// Wraps highlighted code lines in divs so that empty lines stay visible,
// port of the Angular highlight.js plugin in task-body.component.ts
hljs.addPlugin({
  'after:highlight': (params: { value: string }) => {
    const openTags: string[] = [];
    params.value = params.value
      .split('\n')
      .map((line) => {
        line = line.replace(/(<span [^>]+>)|(<\/span>)/g, (match) => {
          if (match === '</span>') {
            openTags.pop();
          } else {
            openTags.push(match);
          }
          return match;
        });
        const visibleLine = line.trim() === '' ? '&#10;' : line;
        return `<div>${openTags.join('')}${visibleLine}${'</span>'.repeat(openTags.length)}</div>`;
      })
      .join('');
  }
});

/**
 * Removes scripts and event-handler attributes from HTML shown
 * with trusted={false}. (Angular used its DomSanitizer for this.)
 */
function sanitizeHtml(html: string): string {
  const template = document.createElement('template');
  template.innerHTML = html;
  template.content
    .querySelectorAll('script, style, iframe, object, embed, link, meta')
    .forEach((el) => el.remove());
  template.content.querySelectorAll('*').forEach((el) => {
    Array.from(el.attributes).forEach((attr) => {
      if (
        /^on/i.test(attr.name) ||
        (attr.name === 'href' || attr.name === 'src') && /^\s*javascript:/i.test(attr.value)
      ) {
        el.removeAttribute(attr.name);
      }
    });
  });
  return template.innerHTML;
}

interface TaskBodyProps {
  /** HTML to show inside */
  body: string;
  /**
   * If set to true, then possibly malicious code can be executed (but this is
   * required by some tasks). Set to true only when sure about data origin.
   */
  trusted?: boolean;
}

/**
 * Renders task HTML: highlights code blocks, typesets LaTeX math with
 * MathJax, and expands KSI panels (collapsibles and tips).
 * Port of the Angular TaskBodyComponent.
 */
export function TaskBody({ body, trusted = false }: TaskBodyProps): React.ReactElement {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const rootEl = containerRef.current;
    if (!rootEl) {
      return;
    }
    rootEl.innerHTML = trusted ? body : sanitizeHtml(body);
    const mounted: Root[] = [];

    const mountPanel = (el: Element, node: React.ReactNode): void => {
      const placeholder = document.createElement('span');
      el.replaceWith(placeholder);
      const panelRoot = createRoot(placeholder);
      panelRoot.render(node);
      mounted.push(panelRoot);
    };

    // parse KSI collapse (legacy format first, so its content is parsed too)
    rootEl.querySelectorAll('.panel.panel-ksi').forEach((el) => {
      const title = el.querySelector('.panel-title')?.querySelector('a')?.innerHTML || '';
        const content = el.querySelector('.panel-body')?.innerHTML || '';
      mountPanel(
        el,
        <TaskCollapsible
          title={title}
          content={content}
          trustedContent={trusted}
          initialOpen={false}
          collapsible
        />
      );
    });
    // parse KSI collapse (new format)
    rootEl.querySelectorAll('.ksi-custom.ksi-collapse').forEach((el) => {
      const title = el.getAttribute('title') || '';
      const content = el.innerHTML || '';
      const isOpened = (el.getAttribute('opened') || el.getAttribute('data-opened') || 'no').toLowerCase() === 'yes';
      const isClosable = (el.getAttribute('closable') || el.getAttribute('data-closable') || 'yes').toLowerCase() !== 'no';
      mountPanel(
        el,
        <TaskCollapsible
          title={title}
          content={content}
          trustedContent={trusted}
          initialOpen={!isClosable || isOpened}
          collapsible={isClosable}
        />
      );
    });

    // parse KSI tips
    rootEl.querySelectorAll('.ksi-custom.ksi-tip').forEach((el) => {
      const title = el.getAttribute('title') || '';
      // sometimes the backend parses the author/image attributes as
      // data-author/data-image, account for both
      const authorStr = el.getAttribute('author') || el.getAttribute('data-author');
      const author = authorStr ? Number(authorStr) : null;
      const image = el.getAttribute('image') || el.getAttribute('data-image');
      const content = el.innerHTML || '';
      mountPanel(el, <TaskTip title={title} content={content} author={author} image={image} />);
    });

    // highlight source code
    rootEl.querySelectorAll('pre > code:not(.highlighted)').forEach((code) => {
      let isPlaintext = true;
      code.classList.forEach((cls) => {
        if (cls !== 'sourceCode') {
          isPlaintext = false;
          code.classList.add(`language-${cls}`);
        }
      });
      if (isPlaintext) {
        code.classList.add('language-txt');
      }
      code.classList.add('highlighted');
      hljs.highlightElement(code as HTMLElement);
    });

    // typeset LaTeX math
    rootEl.querySelectorAll('.math:not(.highlighted)').forEach((math) => {
      math.classList.add('highlighted');
      let tex: string = math.textContent || '';
      math.innerHTML = '';
      // remove unneeded \[ and \( from the start and the end
      tex = tex
        .trim()
        .replace(/^\\\(((?:.|\n)*)\\\)$/gm, '$1')
        .replace(/^\\\[((?:.|\n)*)\\\]$/gm, '$1');
      const node = window.MathJax.tex2svg(tex, { display: false });
      math.appendChild(node);
    });

    return () => {
      mounted.forEach((panelRoot) => panelRoot.unmount());
    };
  }, [body, trusted]);

  return <div className="task-body content" ref={containerRef} />;
}
