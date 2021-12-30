import { Component, OnInit, ChangeDetectionStrategy, Input, ViewChild, ElementRef } from '@angular/core';
import highlight from "highlight.js";
import 'mathjax/es5/tex-svg'; // allows us to call window.MathJax.tex2svg

@Component({
  selector: 'ksi-task-body',
  templateUrl: './task-body.component.html',
  styleUrls: ['./task-body.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TaskBodyComponent implements OnInit {
  @Input()
  body: string;

  @ViewChild('content', { static: false })
  set article(content: ElementRef<HTMLElement>) {
    if (this.articleObserver) {
      this.articleObserver.disconnect();
      this.articleObserver = null;
    }
    if (!content) {
      return;
    }
    const { nativeElement } = content;
    this.articleObserver = new MutationObserver(() => {
      this.highlightCodeAndMath(nativeElement);
    });
    this.articleObserver.observe(nativeElement, {
      childList: true,
      subtree: true
    });
    this.highlightCodeAndMath(nativeElement);
  }

  private articleObserver: MutationObserver | null = null;

  constructor() { }

  ngOnInit(): void {
  }

  private highlightCodeAndMath(rootElement: HTMLElement) {
    rootElement.querySelectorAll('pre>code:not(.highlighted)').forEach((code) => {
      code.classList.forEach((cls) => {
        if (cls !== 'sourceCode') {
          code.classList.add(`language-${cls}`);
        }
      });
      code.classList.add('highlighted');
      highlight.highlightElement(code as HTMLElement);
    });
    rootElement.querySelectorAll('.math:not(.highlighted)').forEach((math) => {
      math.classList.add('highlighted');
      let tex = math.textContent || '';
      math.innerHTML = '';

      tex = tex.replace(/^\\\((.*)\\\)$/, "$1");

      // @ts-ignore
      const node = window.MathJax.tex2svg(tex, {display: false});
      math.appendChild(node);
    });
  }
}
