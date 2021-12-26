import { Component, OnInit, ChangeDetectionStrategy, Input, ChangeDetectorRef } from '@angular/core';
import { ModuleService } from "../../../../services";
import { ModuleGeneral, ModuleGeneralSubmittedFiles } from "../../../../../api";
import { Observable } from "rxjs";

@Component({
  selector: 'ksi-task-module-general',
  templateUrl: './task-module-general.component.html',
  styleUrls: ['./task-module-general.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TaskModuleGeneralComponent implements OnInit {
  @Input()
  module: ModuleGeneral;

  submittedFiles: ModuleGeneralSubmittedFiles[] = [];

  filesToUpload: File[] = [];

  uploadedFile?: File;
  uploadedProgress$: Observable<number>;

  constructor(private moduleService: ModuleService, private cd: ChangeDetectorRef) { }

  ngOnInit(): void {
    this.submittedFiles = [...this.module.submitted_files];
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
        this.uploadedFile = undefined;
        this.upload();
        this.cd.markForCheck();
      }
      // TODO handle fail
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

    this.cd.markForCheck();
  }

  cancelUpload(file: File): void {
    this.filesToUpload = this.filesToUpload.filter((x) => x !== file);
    this.cd.markForCheck();
  }

  deleteFile(file: ModuleGeneralSubmittedFiles) {
    // TODO yes/no question
    this.moduleService.deleteFile(file).subscribe();
  }

  downloadFile(file: ModuleGeneralSubmittedFiles) {
    this.moduleService.downloadFile(file).subscribe();
  }
}
