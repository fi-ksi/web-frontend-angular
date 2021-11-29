import { Component, OnInit, ChangeDetectionStrategy, Input } from '@angular/core';
import { KSIModule } from "../../../../api";
import { UserService } from "../../../services/shared/user.service";

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

  constructor(public user: UserService) { }

  ngOnInit(): void {
    this.moduleAny = this.module;
  }

}
