import { Component, OnInit, ChangeDetectionStrategy, Input } from '@angular/core';
import { TaskWithIcon, WaveDetails, WaveView } from "../../../models";
import { TasksService } from "../../../services";
import { Observable } from "rxjs";

@Component({
  selector: 'ksi-wave',
  templateUrl: './wave.component.html',
  styleUrls: ['./wave.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WaveComponent implements OnInit {
  @Input()
  wave: WaveDetails;

  @Input()
  viewMode$: Observable<WaveView>;

  // tasks ordered that all requirements of the tasks are before it
  tasksOrdered: TaskWithIcon[];

  constructor() { }

  ngOnInit(): void {
    this.tasksOrdered = TasksService.sortTasks(this.wave.tasks, true);
  }
}
