import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { TasksService } from "../../../services";
import { WaveDetails } from "../../../models";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";

@Component({
  selector: 'ksi-page-tasks',
  templateUrl: './page-tasks.component.html',
  styleUrls: ['./page-tasks.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PageTasksComponent implements OnInit {
  nonEmptyWaves$: Observable<WaveDetails[]>;

  constructor(public tasks: TasksService) { }

  ngOnInit(): void {
    this.nonEmptyWaves$ = this.tasks.waveDetails$.pipe(
      map((waves) => waves.filter((wave) => wave.tasks.length > 0))
    );
  }
}
