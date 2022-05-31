import { Component, OnInit, ChangeDetectionStrategy, Input } from '@angular/core';
import { TaskWithIcon } from '../../../models';
import { TasksService, UserService } from '../../../services';
import { merge, Observable } from 'rxjs';
import { mapTo, mergeMap } from 'rxjs/operators';

@Component({
  selector: 'ksi-task-icon',
  templateUrl: './task-icon.component.html',
  styleUrls: ['./task-icon.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TaskIconComponent implements OnInit {
  @Input()
  set task(val: TaskWithIcon) {
    // refresh task's data when its requirements change
    const refreshTaskCache$: Observable<boolean> = merge(
      this.tasks.watchTaskRequirementsStateChange(val).pipe(mapTo(true)),
      this.tasks.getTask(val.id).pipe(mapTo(false))
    );

    // subscribe to the task and so that task info is updated on its solve, etc.
    this.task$ = refreshTaskCache$.pipe(
      mergeMap((refreshCache) => this.tasks.getTaskOnce(val.id, refreshCache))
    );
  }

  task$: Observable<TaskWithIcon>;

  constructor(public user: UserService, private tasks: TasksService) { }

  ngOnInit(): void {
  }

}
