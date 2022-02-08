import { Component, OnInit, ChangeDetectionStrategy, Input } from '@angular/core';
import { TaskWithIcon } from "../../../../models";
import { Observable } from "rxjs";
import { RoutesService, TasksService, UserService } from "../../../../services";

@Component({
  selector: 'ksi-wave-task-linear',
  templateUrl: './wave-task-linear.component.html',
  styleUrls: ['./wave-task-linear.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WaveTaskLinearComponent implements OnInit {
  @Input()
  set task(val: TaskWithIcon) {
    // subscribe to the task so that task info is updated on its solve, etc.
    this.task$ = this.tasks.getTask(val.id);
  }

  task$: Observable<TaskWithIcon>;

  constructor(public user: UserService, public routes: RoutesService, private tasks: TasksService) { }

  ngOnInit(): void {
  }
}
