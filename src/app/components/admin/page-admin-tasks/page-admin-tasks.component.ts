import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { KsiTitleService, TasksService, YearsService } from '../../../services';
import { AdminTask, Wave } from '../../../../api';
import { combineLatest, Observable, of } from 'rxjs';
import { map, mergeMap } from 'rxjs/operators';

interface WaveTasks {
  wave: Wave,
  tasks: AdminTask[]
}

@Component({
  selector: 'ksi-page-admin-tasks',
  templateUrl: './page-admin-tasks.component.html',
  styleUrls: ['./page-admin-tasks.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PageAdminTasksComponent implements OnInit {
  waveTasks$: Observable<WaveTasks[]>;

  constructor(private years: YearsService, private title: KsiTitleService, private tasks: TasksService) { }

  ngOnInit(): void {
    this.waveTasks$ = this.years.adminTasks$.pipe(
      mergeMap((tasks) => {
        const waveIdTasks: {[waveId: number]: AdminTask[]} = {};
        tasks.forEach((task) => {
          if (!(task.wave in waveIdTasks)) {
            waveIdTasks[task.wave] = [];
          }
          waveIdTasks[task.wave].push(task);
        });

        const waves$: Observable<Wave[]> = combineLatest(
          Object.keys(waveIdTasks).map((waveId) => this.tasks.cacheWaves.get(Number(waveId)))
        );
        const waveTasks$: Observable<AdminTask[][]> = of(
          Object.keys(waveIdTasks).map((waveId) => waveIdTasks[Number(waveId)])
        );

        return combineLatest([waves$, waveTasks$]);
      }),
      map(([waves, waveTasks]) => {
        return waves.map((wave, i) => ({wave, tasks: waveTasks[i]}));
      }),
      map((waveTasks) => {
        return waveTasks.sort((a, b) => b.wave.id - a.wave.id);
      })
    );
    this.title.subtitle = 'admin.root.tasks.title';
  }
}
