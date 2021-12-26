import { Component, OnInit, ChangeDetectionStrategy, Input, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { ModuleProgramming } from "../../../../../api";
import { FormControl } from "@angular/forms";

/**
 * Import CodeMirror libraries
 */
// @ts-ignore
import * as CodeMirror from '../../../../../../node_modules/codemirror/lib/codemirror';
import '../../../../../../node_modules/codemirror/mode/python/python';
import { Subscription } from "rxjs";

@Component({
  selector: 'ksi-task-module-programming',
  templateUrl: './task-module-programming.component.html',
  styleUrls: ['./task-module-programming.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TaskModuleProgrammingComponent implements OnInit, OnDestroy {
  @ViewChild('codeEditor', { static: true })
  private codeEditorContainer: ElementRef<HTMLDivElement>;

  @Input()
  module: ModuleProgramming;

  code: FormControl = new FormControl();

  private subs: Subscription[] = [];

  constructor() { }

  ngOnDestroy(): void {
    this.subs.forEach((sub) => sub.unsubscribe());
  }

  ngOnInit(): void {
    this.initCodeEditor();
    this.code.setValue(this.module.code || this.module.defaultCode);
  }

  /**
   * Inits internal code editor.
   * Code editor is hooked to update the value of this.code.
   * This.code updates the value of the editor on change.
   * @private
   */
  private initCodeEditor(): void {
    // @ts-ignore
    const editor = CodeMirror(this.codeEditorContainer.nativeElement, {
      lineNumbers: true,
    });
    // @ts-ignore
    editor.on('change', (event) => this.code.setValue(event.doc.getValue()));
    this.subs.push(this.code.valueChanges.subscribe((value) => {
      if (editor.doc.getValue() !== value) {
        editor.doc.setValue(value);
      }
    }));
  }
}
