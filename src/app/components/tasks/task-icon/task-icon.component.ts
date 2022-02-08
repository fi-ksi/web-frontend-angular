import { Component, OnInit, ChangeDetectionStrategy, Input } from '@angular/core';
import { TaskWithIcon } from "../../../models";
import { TasksService, UserService } from "../../../services";
import { Observable } from "rxjs";

@Component({
  selector: 'ksi-task-icon',
  templateUrl: './task-icon.component.html',
  styleUrls: ['./task-icon.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TaskIconComponent implements OnInit {
  @Input()
  set task(val: TaskWithIcon) {
    // subscribe to the task so that task info is updated on its solve, etc.
    this.task$ = this.tasks.getTask(val.id);
  }

  task$: Observable<TaskWithIcon>;

  constructor(public user: UserService, private tasks: TasksService) { }

  ngOnInit(): void {
  }

}
