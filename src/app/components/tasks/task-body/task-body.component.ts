import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  Input,
  ViewChild,
  ElementRef,
  ComponentFactoryResolver,
  ComponentFactory,
  ViewContainerRef, Type
} from '@angular/core';
import highlight from 'highlight.js';
import 'mathjax/es5/tex-svg'; // allows us to call window.MathJax.tex2svg
import { TaskCollapsibleComponent } from './task-collapsible/task-collapsible.component';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { TaskTipComponent } from './task-tip/task-tip.component';
import { TaskPanel, TaskTipData } from '../../../models';

@Component({
  selector: 'ksi-task-body',
  templateUrl: './task-body.component.html',
  styleUrls: ['./task-body.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TaskBodyComponent implements OnInit {
  @Input()
  body: string;

  @Input()
  trusted = false;

  html: string | SafeHtml;

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

  private panelFactories: {[componentName: string]: ComponentFactory<TaskPanel<unknown>>} = {};

  constructor(private resolver: ComponentFactoryResolver, private container: ViewContainerRef, private sanitizer: DomSanitizer) { }

  ngOnInit(): void {
    if (this.trusted) {
      this.html = this.sanitizer.bypassSecurityTrustHtml(this.body);
    } else {
      this.html = this.body;
    }
    this.body = '';
  }

  private applyTaskContentStyle(rootElement: HTMLElement): void {
    // parse KSI collapse
    // must be parsed first so that its content is also parsed
    rootElement.querySelectorAll('.panel.panel-ksi').forEach((el) => {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const title = el.querySelector('.panel-title')!.textContent!;
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const body = el.querySelector('.panel-body')!.innerHTML!;
      el.replaceWith(this.createKSIPanel(title, body, TaskCollapsibleComponent, 'ksi-collapsible'));
    });

    // parse KSI tip
    rootElement.querySelectorAll('ksi-tip').forEach((el) => {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const title = el.getAttribute('title');
      const authorStr = el.getAttribute('author');
      const author = authorStr ? Number(authorStr) : null;
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const body = el.innerHTML!;
      el.replaceWith(this.createKSIPanel<TaskTipData>(title || '', body, TaskTipComponent, 'ksi-tip', {author}));
    });

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
      let tex: string = math.textContent || '';
      math.innerHTML = '';

      // remove unneeded \[ and \( from the start and the end
      tex = tex
        .trim()
        .replace(/^\\\(((?:.|\n)*)\\\)$/gm, '$1')
        .replace(/^\\\[((?:.|\n)*)\\]$/gm, '$1');

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const node = window.MathJax.tex2svg(tex, {display: false});
      math.appendChild(node);
    });
  }

  /**
   * Creates a new KSI panel
   * @param title title of the panel
   * @param body HTML content of the panel
   * @param component what component to create
   * @param factoryName unique name of factory for each component type (can be component's tag)
   * @param data additional data passed to the info panel
   * @private
   */
  private createKSIPanel<T>(title: string, body: string, component: Type<TaskPanel<T>>, factoryName: string, data?: T): HTMLElement {
    if (this.panelFactories[factoryName] === undefined) {
      this.panelFactories[factoryName] = this.resolver.resolveComponentFactory(component);
    }
    const comp = this.container.createComponent(this.panelFactories[factoryName]);

    comp.instance.title = title;
    comp.instance.content = body;
    if (data !== undefined) {
      comp.instance.data = data;
    }

    window.setTimeout(() => comp.instance.cd.markForCheck());

    return comp.instance.el.nativeElement;
  }
}
