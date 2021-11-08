import { Injectable } from '@angular/core';
import { BackendService } from "../shared/backend.service";
import { combineLatest, merge, Observable } from "rxjs";
import { Task } from "../../../api";
import { YearsService } from "../shared/years.service";
import { map, mergeMap } from "rxjs/operators";
import { WaveDetails } from "../../models";
import { Wave } from "src/api";

@Injectable({
  providedIn: 'root'
})
export class TasksService {
  waveDetails$: Observable<WaveDetails[]>;
  waves$: Observable<Wave[]>;

  constructor(private backend: BackendService, private year: YearsService) {
    const tasks$: Observable<Task[]> = merge(
      backend.user$.pipe(map(() => this.year.selected)),
      year.selected$
    ).pipe(
      mergeMap((year) => this.backend.http.tasksGetAll(year?.id)),
      map((response) => response.tasks)
    );

    this.waves$ =  year.selected$.pipe(
      mergeMap((year) => this.backend.http.wavesGetAll(year?.id)),
      map((response) => response.waves)
    );

    this.waveDetails$ = combineLatest([
      tasks$,
      this.waves$,
    ]).pipe(map(([tasks, waveHeads]) => {
      return waveHeads.map((waveHead) => ({
        ...waveHead,
        tasks: tasks.filter((task) => task.wave === waveHead.id)
      }));
    }));
  }
}
