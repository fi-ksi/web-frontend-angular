import { Component, OnInit, ChangeDetectionStrategy, Input } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { TaskWithIcon } from '../../../../models';
import { RoutesService, TasksService } from '../../../../services';
import { catchError } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';

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

  task$: Observable<TaskWithIcon | null>;

  constructor(private tasks: TasksService, public routes: RoutesService) { }

  ngOnInit(): void {
    this.task$ = this.tasks.getTask(this.taskId).pipe(
      catchError((error) => {
        if (error instanceof HttpErrorResponse && Math.floor(error.status / 100) === 4) {
          // happens e. g. if user stumbles upon yet unpublished task
          return of(null);
        }

        return throwError(error);
      })
    );
  }
}
