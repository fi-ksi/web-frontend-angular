import { Injectable } from '@angular/core';
import { BackendService } from "../shared/backend.service";
import { combineLatest, merge, Observable } from "rxjs";
import { YearsService } from "../shared/years.service";
import { map, mergeMap, shareReplay } from "rxjs/operators";
import { TaskWithIcon, WaveDetails } from "../../models";
import { Wave } from "src/api";
import { Utils } from "../../util";

@Injectable({
  providedIn: 'root'
})
export class TasksService {
  waveDetails$: Observable<WaveDetails[]>;
  waves$: Observable<Wave[]>;

  constructor(private backend: BackendService, private year: YearsService) {
    const tasks$: Observable<TaskWithIcon[]> = merge(
      backend.user$.pipe(map(() => this.year.selected)),
      year.selected$
    ).pipe(
      mergeMap((year) => this.backend.http.tasksGetAll(year?.id)),
      map((response) => response.tasks.map((task) => ({
        ...task,
        icon: Utils.getTaskIconURL(task),
      })))
    );

    this.waves$ =  year.selected$.pipe(
      mergeMap((year) => this.backend.http.wavesGetAll(year?.id)),
      map((response) => response.waves)
    );

    this.waveDetails$ = combineLatest([
      tasks$,
      this.waves$,
    ]).pipe(
      map(([tasks, waveHeads]) => {
        return waveHeads.map((waveHead) => ({
          ...waveHead,
          tasks: tasks.filter((task) => task.wave === waveHead.id)
        }));
    }), shareReplay(1)
    );
  }
}
