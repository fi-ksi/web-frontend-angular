import { Component, OnInit, ChangeDetectionStrategy, Input } from '@angular/core';
import { TaskWithIcon } from "../../../../models";
import { merge, Observable } from "rxjs";
import { RoutesService, TasksService, UserService } from "../../../../services";
import { mapTo, mergeMap } from "rxjs/operators";

@Component({
  selector: 'ksi-wave-task-linear',
  templateUrl: './wave-task-linear.component.html',
  styleUrls: ['./wave-task-linear.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WaveTaskLinearComponent implements OnInit {
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

  constructor(public user: UserService, public routes: RoutesService, private tasks: TasksService) { }

  ngOnInit(): void {
  }
}
