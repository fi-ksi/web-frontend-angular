import { Injectable } from '@angular/core';
import { BackendService } from "../shared/backend.service";
import { merge, Observable } from "rxjs";
import { Task } from "../../../api";
import { YearsService } from "../shared/years.service";
import { map, mergeMap } from "rxjs/operators";

@Injectable({
  providedIn: 'root'
})
export class TasksService {
  tasks$: Observable<Task[]>;

  constructor(private backend: BackendService, private year: YearsService) {
    this.tasks$ = merge(
      backend.user$.pipe(map(() => this.year.selected)),
      year.selected$
    ).pipe(
      mergeMap((year) => this.backend.http.tasksGetAll(year?.id)),
      map((response) => response.tasks)
    );
  }
}
