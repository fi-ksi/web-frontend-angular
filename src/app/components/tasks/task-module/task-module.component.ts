import { Component, OnInit, ChangeDetectionStrategy, Input, HostBinding } from '@angular/core';
import { KSIModule, ModuleSubmitResponse } from '../../../../api';
import { BehaviorSubject, merge, Observable, Subject } from 'rxjs';
import { IconService, ModuleService, UserService } from '../../../services';
import { map, shareReplay, tap } from 'rxjs/operators';

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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  moduleAny: any;

  statusChanges$: Observable<ModuleSubmitResponse | null>;

  private readonly packedSubject: Subject<boolean> = new BehaviorSubject<boolean>(false);
  packed$: Observable<boolean>;

  constructor(public user: UserService, private moduleService: ModuleService, public icon: IconService) { }

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
      }),
      shareReplay(1)
    );

    this.packed$ = merge(
      this.packedSubject.asObservable(),
      this.statusChanges$.pipe(map((status) => status?.result === 'ok'))
    );

    this.moduleAny = this.module;
    switch (this.module.state) {
    case 'correct':
      if (this.module.autocorrect) {
        this.packedSubject.next(true);
        this.resultOk = true;
      }
      break;
    case 'incorrect':
      this.resultBad = true;
      break;
    }
  }

  unpack(): void {
    this.packedSubject.next(false);
  }
}
