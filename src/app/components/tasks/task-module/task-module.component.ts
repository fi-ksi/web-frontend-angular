import { Component, OnInit, ChangeDetectionStrategy, Input, HostBinding } from '@angular/core';
import { KSIModule, ModuleSubmitResponse } from "../../../../api";
import { UserService } from "../../../services/shared/user.service";
import { Observable } from "rxjs";
import { ModuleService } from "../../../services";
import { tap } from "rxjs/operators";

@Component({
  selector: 'ksi-task-module',
  templateUrl: './task-module.component.html',
  styleUrls: ['./task-module.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TaskModuleComponent implements OnInit {
  @Input()
  module: KSIModule;

  @HostBinding('class.result-ok')
  resultOk: boolean;

  @HostBinding('class.result-bad')
  resultBad: boolean;

  /**
   * this.module typed as any
   */
  moduleAny: any;

  statusChanges$: Observable<ModuleSubmitResponse | null>;

  constructor(public user: UserService, private moduleService: ModuleService) { }

  ngOnInit(): void {
    this.statusChanges$ = this.moduleService.statusChanges(this.module).pipe(
      tap((status) => {
        /*
        Assign correct host class
         */
        if (!status) {
          this.resultOk = this.resultBad = false;
        } else if (status.result === 'ok') {
          this.resultOk = true;
          this.resultBad = false;
        } else {
          this.resultBad = true;
          this.resultOk = false;
        }
      })
    );

    this.moduleAny = this.module;
    switch (this.module.state) {
      case "correct":
        this.resultOk = true;
        break;
      case "incorrect":
        this.resultBad = true;
        break;
    }
  }
}
