/* eslint-disable @typescript-eslint/ban-ts-comment */
import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  Input,
  ViewChild,
  ElementRef,
  OnDestroy,
  ChangeDetectorRef
} from '@angular/core';
import { ModuleProgramming, RunCodeResponse } from '../../../../../api/backend';
import { FormControl } from '@angular/forms';

/**
 * Import CodeMirror libraries
 */
// @ts-ignore
import * as CodeMirror from '../../../../../../node_modules/codemirror/lib/codemirror';
import '../../../../../../node_modules/codemirror/mode/python/python';
import { Observable, Subscription } from 'rxjs';
import { EdulintService, ModalService, ModuleService, UserService } from '../../../../services';
import { distinct, mapTo, shareReplay, tap } from 'rxjs/operators';
import { EdulintReport } from '../../../../models';

// noinspection JSUnresolvedReference
@Component({
  selector: 'ksi-task-module-programming',
  templateUrl: './task-module-programming.component.html',
  styleUrls: ['./task-module-programming.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TaskModuleProgrammingComponent implements OnInit, OnDestroy {
  @ViewChild('codeEditor', { static: true })
  private codeEditorContainer: ElementRef<HTMLDivElement>;

  @ViewChild('runOutput', { static: false })
  private runOutput: ElementRef<HTMLDivElement>;

  @ViewChild('uploadFile', { static: true })
  private uploadFileInput: ElementRef<HTMLInputElement>;

  @Input()
  module: ModuleProgramming;

  code: FormControl = new FormControl();

  codeRunResult$: Observable<RunCodeResponse> | null;

  submission$: Observable<void> | null = null;
  codeRun$: Observable<void> | null = null;
  linting$: Observable<EdulintReport> | null = null;

  private subs: Subscription[] = [];

  constructor(private moduleService: ModuleService, public user: UserService, private cd: ChangeDetectorRef, private modal: ModalService, private lint: EdulintService) { }

  ngOnDestroy(): void {
    this.subs.forEach((sub) => sub.unsubscribe());
  }

  ngOnInit(): void {
    this.initCodeEditor();
    this.code.setValue(this.module.code || this.module.default_code);
  }

  submit(): void {
    if (this.submission$) {
      return;
    }

    this.codeRunResult$ = null;
    (this.submission$ = this.moduleService.submit(this.module, this.code.value)).subscribe(() => {
      this.submission$ = null;
      this.cd.markForCheck();
    });
    this.cd.markForCheck();
  }

  runCode(): void {
    if (this.codeRun$) {
      return;
    }

    this.moduleService.hideSubmit(this.module);
    this.codeRunResult$ = this.moduleService.runCode(this.module, this.code.value).pipe(
      shareReplay(1),
      tap((result) => {
        // Scroll stdout into view after run completed
        window.setTimeout(() => {
          if (this.runOutput && this.runOutput.nativeElement) {
            this.runOutput.nativeElement.scrollIntoView({behavior: 'smooth', block: 'start', inline: 'nearest'});
          }
        });

        if (result.result === 'ok') {
          this.lintCode();
        }
      }),
      shareReplay(1),
    );
    (this.codeRun$ = this.codeRunResult$.pipe(mapTo(undefined))).subscribe(() => {
      this.codeRun$ = null;
      this.cd.markForCheck();
    });
    this.cd.markForCheck();
  }

  /**
   * Downloads current code onto clients disc
   */
  download(): void {
    const date = new Date();
    // https://stackoverflow.com/questions/990904/remove-accents-diacritics-in-a-string-in-javascript#37511463
    const moduleName = this.module.name
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/\s/g, '-')
      .toLowerCase();
    // https://stackoverflow.com/questions/45831191/generate-and-download-file-from-js#45831280
    const el = document.createElement('a');
    el.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(this.code.value));
    el.setAttribute('download',
      `ksi_${moduleName}` +
      `_${date.getFullYear()}${date.getMonth() + 1}` +
      `${date.getDate()}_${date.getHours()}${date.getMinutes()}${date.getSeconds()}.py`);
    el.style.display = 'none';
    document.body.appendChild(el);
    el.click();
    document.body.removeChild(el);
  }

  /**
   * Replace current code with external file content
   */
  upload(): void {
    this.uploadFileInput.nativeElement.click();
  }

  /**
   * Replaces code with a content of a selected file
   * @param event
   */
  async replaceCode(event: Event): Promise<void> {
    const { files } = (event.target as HTMLInputElement);
    if (!files || !files.length) {
      return;
    }

    const file = files[0];
    this.code.setValue(await file.text());
  }

  reset(): void {
    this.modal.yesNo('tasks.module.programming.reset-confirm', false).subscribe((confirmation) => {
      if (confirmation) {
        this.code.setValue(this.module.default_code);
      }
    });
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
      indentUnit: 4,  // PEP-8 needs 4 spaces
    });
    // map tab key to spaces
    editor.setOption('extraKeys', {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      Tab: function(cm: any) {
        const spaces = Array(cm.getOption('indentUnit') + 1).join(' ');
        cm.replaceSelection(spaces);
      }
    });
    // @ts-ignore
    editor.on('change', (event) => this.code.setValue(event.doc.getValue()));
    this.subs.push(this.code.valueChanges.subscribe((value: string) => {
      // replace all tabs with spaces
      value = value.replace(/\t/g, '    ');
      if (editor.doc.getValue() !== value) {
        editor.doc.setValue(value);
      }
    }));
  }

  lintCode(): void {
    this.linting$ = null;
    this.linting$ = this.lint.analyzeCode(this.code.value).pipe(distinct());
    this.linting$.subscribe();
  }
}
