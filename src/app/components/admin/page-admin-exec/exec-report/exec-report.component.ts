import { Component, OnInit, ChangeDetectionStrategy, Input, ViewChild, ElementRef } from '@angular/core';
import { EditorView, ViewUpdate, keymap } from '@codemirror/view';
import { indentUnit, HighlightStyle, syntaxHighlighting } from "@codemirror/language";
import { indentWithTab } from '@codemirror/commands';
import { python } from '@codemirror/lang-python';
import { tags } from "@lezer/highlight";

import { Observable, Subscription } from 'rxjs';
import { EdulintService, ModalService, ModuleService, UserService } from '../../../../services';
import { distinct, mapTo, shareReplay, tap } from 'rxjs/operators';
import { EdulintReport } from '../../../../models';
import { basicSetup } from 'codemirror';

@Component({
  selector: 'ksi-exec-report',
  templateUrl: './exec-report.component.html',
  styleUrls: ['./exec-report.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class ExecReportComponent implements OnInit {
  @ViewChild('codeEditor', { static: true })
  private codeEditorContainer: ElementRef<HTMLDivElement>;

  @Input() code: string;
  @Input() report: string;

  linting$: Observable<EdulintReport> | null = null;

  constructor(
  ) { }

  ngOnInit(): void {
    this.initCodeEditor();
  }

  /**
 * Inits internal code editor.
 * Code editor is hooked to update the value of this.code.
 * This.code updates the value of the editor on change.
 * @private
 */
  private initCodeEditor(): void {
    const highlightStyle = HighlightStyle.define([
      {
        tag: tags.number,
        color: "var(--ksi-code-number)"
      },
      {
        tag: tags.keyword,
        color: "var(--ksi-code-keyword)"
      },
      {
        tag: tags.bool,
        color: "var(--ksi-code-keyword)"
      },
      {
        tag: tags.function(tags.definition(tags.variableName)), // function definition
        color: "var(--ksi-code-def)"
      },
      {
        tag: tags.definition(tags.className), // class definition
        color: "var(--ksi-code-def)"
      },
      {
        tag: tags.comment,
        color: "var(--ksi-code-comment)"
      },
      {
        tag: tags.string,
        color: "var(--ksi-code-string)"
      },
      {
        tag: tags.meta,
        color: "var(--ksi-code-meta)"
      }
    ])

    const editor = new EditorView({
      doc: this.code || '',
      parent: this.codeEditorContainer.nativeElement,
      extensions: [
        basicSetup, // default extensions
        indentUnit.of('    '), // PEP-8 needs 4 spaces
        keymap.of([indentWithTab]), // tab keymap

        syntaxHighlighting(highlightStyle), // own colors for highlighting
        python(), // support for python
      ],
    });

  }


}
