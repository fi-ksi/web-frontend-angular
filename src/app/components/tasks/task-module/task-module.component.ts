import { Component, OnInit, ChangeDetectionStrategy, Input } from '@angular/core';
import { KSIModule, ModuleSubmitResponse } from "../../../../api";
import { UserService } from "../../../services/shared/user.service";
import { Observable } from "rxjs";
import { ModuleService } from "../../../services";

@Component({
  selector: 'ksi-task-module',
  templateUrl: './task-module.component.html',
  styleUrls: ['./task-module.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TaskModuleComponent implements OnInit {
  @Input()
  module: KSIModule;

  moduleAny: any;

  statusChanges$: Observable<ModuleSubmitResponse>;

  constructor(public user: UserService, private moduleService: ModuleService) { }

  ngOnInit(): void {
    this.statusChanges$ = this.moduleService.statusChanges(this.module);
    this.moduleAny = this.module;
  }
}
