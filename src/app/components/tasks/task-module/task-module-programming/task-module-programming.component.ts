import { Component, OnInit, ChangeDetectionStrategy, Input } from '@angular/core';
import { ModuleProgramming } from "../../../../../api";
import { FormControl } from "@angular/forms";

@Component({
  selector: 'ksi-task-module-programming',
  templateUrl: './task-module-programming.component.html',
  styleUrls: ['./task-module-programming.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TaskModuleProgrammingComponent implements OnInit {
  @Input()
  module: ModuleProgramming;

  code: FormControl = new FormControl();

  constructor() { }

  ngOnInit(): void {
    this.code.setValue(this.module.code || this.module.defaultCode);
  }

}
