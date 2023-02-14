import { Component, OnInit, ChangeDetectionStrategy, Input, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { ModalService, ModuleService } from '../../../../services';
import { ModuleGeneral, ModuleGeneralSubmittedFiles } from '../../../../../api/backend';
import { Observable, Subject, Subscription } from 'rxjs';
import { debounceTime, map, mergeMap } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'ksi-task-module-general',
  templateUrl: './task-module-general.component.html',
  styleUrls: ['./task-module-general.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TaskModuleGeneralComponent implements OnInit, OnDestroy {
  @Input()
  module: ModuleGeneral;

  submittedFiles: ModuleGeneralSubmittedFiles[] = [];

  error$: Observable<string>;

  private refreshSubmittedFiles: Subject<void> = new Subject<void>();

  filesToUpload: File[] = [];

  uploadedFile?: File;
  uploadedProgress$: Observable<number>;

  private subs: Subscription[] = [];

  private static readonly MAX_UPLOAD_SIZE_MB = 20;
  private static readonly MAX_UPLOAD_FILES = 20;

  constructor(
    private moduleService: ModuleService,
    private cd: ChangeDetectorRef,
    private modal: ModalService,
    private translate: TranslateService
  ) { }

  ngOnInit(): void {
    this.submittedFiles = [...this.module.submitted_files];
    this.subs.push(
      this.refreshSubmittedFiles.asObservable()
        .pipe(
          debounceTime(500),
          mergeMap(() => this.moduleService.refreshModule(this.module)),
          map((module) => module.submitted_files)
        ).subscribe((submittedFiles) => {
          this.submittedFiles = submittedFiles;
          this.checkUploadAllowed();
          this.cd.markForCheck();
        })
    );
  }

  ngOnDestroy(): void {
    this.subs.forEach((sub) => sub.unsubscribe());
  }

  upload(): void {
    if (this.uploadedFile || !this.filesToUpload || !this.filesToUpload.length) {
      // already in progress
      return;
    }
    this.uploadedFile = this.filesToUpload.pop();
    const { progress$, response$ } = this.moduleService.uploadFile(this.module, this.uploadedFile!);
    this.uploadedProgress$ = progress$;
    this.cd.markForCheck();
    response$.subscribe((response) => {
      if (response.result === 'ok') {
        this.refreshSubmittedFiles.next();
        this.uploadedFile = undefined;
        this.upload();
        this.cd.markForCheck();
      }
    });
  }

  filesSelected(event: Event): void {
    const el: HTMLInputElement = event.target as HTMLInputElement;
    if (!(el.files?.length)) {
      return;
    }

    for (let i = 0; i < el.files.length; i++) {
      const file = el.files.item(i);
      if (file === null) {
        continue;
      }
      this.filesToUpload.push(file);
    }
    el.value = '';

    this.checkUploadAllowed();
    this.cd.markForCheck();
  }

  cancelUpload(file: File): void {
    this.filesToUpload = this.filesToUpload.filter((x) => x !== file);
    this.checkUploadAllowed();
    this.cd.markForCheck();
  }

  deleteFile(file: ModuleGeneralSubmittedFiles) {
    this.modal.yesNo('tasks.module.general.delete-confirm', false).subscribe((confirmation) => {
      if (confirmation) {
        this.moduleService.deleteFile(file).subscribe(() => this.refreshSubmittedFiles.next());
      }
    });
  }

  downloadFile(file: ModuleGeneralSubmittedFiles) {
    this.moduleService.downloadFile(file).subscribe();
  }

  private checkUploadAllowed(): void {
    if (this.submittedFiles.length + this.filesToUpload.length > TaskModuleGeneralComponent.MAX_UPLOAD_FILES) {
      this.error$ = this.translate
        .get('tasks.module.general.too-many-files', {count: TaskModuleGeneralComponent.MAX_UPLOAD_FILES});
      return;
    }

    for (const file of this.filesToUpload) {
      if (file.size >= TaskModuleGeneralComponent.MAX_UPLOAD_SIZE_MB * 1024 * 1024) {
        this.error$ = this.translate
          .get('tasks.module.general.size-to-large', {size: TaskModuleGeneralComponent.MAX_UPLOAD_SIZE_MB});
        return;
      }
    }
  }
}
