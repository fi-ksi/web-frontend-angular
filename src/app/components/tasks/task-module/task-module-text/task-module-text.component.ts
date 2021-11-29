import { Component, OnInit, ChangeDetectionStrategy, Input } from '@angular/core';
import { ModuleText } from "../../../../../api";
import { FormControl } from "@angular/forms";
import { ModuleService } from "../../../../services";

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

  constructor(private moduleService: ModuleService) { }

  ngOnInit(): void {
    this.inputs = this.module.fields.map(() => new FormControl(''));
  }

  submit(): void {
    this.moduleService.submit(this.module, this.inputs.map((input) => input.value));
  }
}
