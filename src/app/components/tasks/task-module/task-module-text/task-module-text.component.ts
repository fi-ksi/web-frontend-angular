import { Component, OnInit, ChangeDetectionStrategy, Input, ChangeDetectorRef } from '@angular/core';
import { ModuleText } from "../../../../../api";
import { FormControl } from "@angular/forms";
import { ModuleService } from "../../../../services";
import { Observable } from "rxjs";

@Component({
  selector: 'ksi-task-module-text',
  templateUrl: './task-module-text.component.html',
  styleUrls: ['./task-module-text.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TaskModuleTextComponent implements OnInit {
  @Input()
  module: ModuleText;

  inputs: FormControl[];

  submission$: Observable<void> | null = null;

  constructor(private moduleService: ModuleService, private cd: ChangeDetectorRef) { }

  ngOnInit(): void {
    this.inputs = this.module.fields.map(() => new FormControl(''));
  }

  submit(): void {
    if (this.submission$) {
      return;
    }

    (this.submission$ = this.moduleService.submit(this.module, this.inputs.map((input) => input.value)))
      .subscribe(() => {
        this.submission$ = null;
        this.cd.markForCheck();
      });
    this.cd.markForCheck();
  }
}
