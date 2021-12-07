import { Component, OnInit, ChangeDetectionStrategy, Input, ViewChild, ElementRef } from '@angular/core';
import highlight from "highlight.js";

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
      this.highlightCode(nativeElement);
    });
    this.articleObserver.observe(nativeElement, {
      childList: true,
      subtree: true
    });
    this.highlightCode(nativeElement);
  }

  private articleObserver: MutationObserver | null = null;

  constructor() { }

  ngOnInit(): void {
  }


  private highlightCode(rootElement: HTMLElement) {
    rootElement.querySelectorAll('pre>code:not(.highlighted)').forEach((code) => {
      code.classList.forEach((cls) => {
        if (cls !== 'sourceCode') {
          code.classList.add(`language-${cls}`);
        }
      });
      code.classList.add('highlighted');
      highlight.highlightElement(code as HTMLElement);
    });
  }
}
