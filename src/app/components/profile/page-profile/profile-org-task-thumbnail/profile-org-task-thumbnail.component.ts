import { Component, OnInit, ChangeDetectionStrategy, Input } from '@angular/core';
import { Observable } from "rxjs";
import { TaskWithIcon } from "../../../../models";
import { TasksService } from "../../../../services";

@Component({
  selector: 'ksi-profile-org-task-thumbnail',
  templateUrl: './profile-org-task-thumbnail.component.html',
  styleUrls: ['./profile-org-task-thumbnail.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProfileOrgTaskThumbnailComponent implements OnInit {
  @Input()
  taskId: number;

  task$: Observable<TaskWithIcon>;

  constructor(private tasks: TasksService) { }

  ngOnInit(): void {
    this.task$ = this.tasks.getTask(this.taskId);
  }

}
