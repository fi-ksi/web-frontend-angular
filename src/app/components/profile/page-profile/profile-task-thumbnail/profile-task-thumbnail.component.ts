import { Component, OnInit, ChangeDetectionStrategy, Input } from '@angular/core';
import { Observable } from "rxjs";
import { TaskWithIcon } from "../../../../models";
import { RoutesService, TasksService } from "../../../../services";

@Component({
  selector: 'ksi-profile-task-thumbnail',
  templateUrl: './profile-task-thumbnail.component.html',
  styleUrls: ['./profile-task-thumbnail.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProfileTaskThumbnailComponent implements OnInit {
  @Input()
  taskId: number;

  @Input()
  score?: number | null;

  task$: Observable<TaskWithIcon>;

  constructor(private tasks: TasksService, public routes: RoutesService) { }

  ngOnInit(): void {
    this.task$ = this.tasks.getTask(this.taskId);
  }
}
