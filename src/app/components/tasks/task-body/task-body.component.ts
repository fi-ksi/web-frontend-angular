import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  Input,
  ViewChild,
  ElementRef,
  ComponentFactoryResolver,
  ComponentFactory,
  ViewContainerRef
} from '@angular/core';
import highlight from "highlight.js";
import 'mathjax/es5/tex-svg'; // allows us to call window.MathJax.tex2svg
import { TaskCollapsibleComponent } from "./task-collapsible/task-collapsible.component";

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
      this.applyTaskContentStyle(nativeElement);
    });
    this.articleObserver.observe(nativeElement, {
      childList: true,
      subtree: true
    });
    this.applyTaskContentStyle(nativeElement);
  }

  private articleObserver: MutationObserver | null = null;

  private panelFactory?: ComponentFactory<TaskCollapsibleComponent>;

  constructor(private resolver: ComponentFactoryResolver, private container: ViewContainerRef) { }

  ngOnInit(): void {
  }

  private applyTaskContentStyle(rootElement: HTMLElement): void {
    // replace source code
    rootElement.querySelectorAll('pre>code:not(.highlighted)').forEach((code) => {
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
      highlight.highlightElement(code as HTMLElement);
    });

    // replace LaTex math
    rootElement.querySelectorAll('.math:not(.highlighted)').forEach((math) => {
      math.classList.add('highlighted');
      let tex = math.textContent || '';
      math.innerHTML = '';

      tex = tex.replace(/^\\\((.*)\\\)$/, "$1");

      // @ts-ignore
      const node = window.MathJax.tex2svg(tex, {display: false});
      math.appendChild(node);
    });

    // parse KSI collapse
    rootElement.querySelectorAll('.panel.panel-ksi').forEach((el) => {
      const title = el.querySelector('.panel-title')!.textContent!;
      const body = el.querySelector('.panel-body')!.innerHTML!;
      el.replaceWith(this.createKSIPanel(title, body));
    });
  }

  private createKSIPanel(title: string, body: string): HTMLElement {
    if (this.panelFactory === undefined) {
      this.panelFactory = this.resolver.resolveComponentFactory(TaskCollapsibleComponent);
    }
    const comp = this.container.createComponent(this.panelFactory);

    comp.instance.title = title;
    comp.instance.content = body;

    setTimeout(() => comp.instance.cd.markForCheck());

    return comp.instance.el.nativeElement;
  }
}
