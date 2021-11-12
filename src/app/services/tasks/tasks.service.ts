import { Injectable } from '@angular/core';
import { BackendService } from "../shared/backend.service";
import { combineLatest, merge, Observable } from "rxjs";
import { YearsService } from "../shared/years.service";
import { map, mergeMap, shareReplay } from "rxjs/operators";
import { TaskWithIcon, WaveDetails } from "../../models";
import { Wave } from "src/api";
import { Utils } from "../../util";

type TasksLevelMap = {[taskId: number]: number};
type TasksMap = {[taskId: number]: TaskWithIcon};
type TasksLevels = {[level: number]: TaskWithIcon[]};

@Injectable({
  providedIn: 'root'
})
export class TasksService {
  readonly waveDetails$: Observable<WaveDetails[]>;
  readonly waves$: Observable<Wave[]>;
  readonly tasks$: Observable<TaskWithIcon[]>;

  constructor(private backend: BackendService, private year: YearsService) {
    this.tasks$ = merge(
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
      this.tasks$,
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

  public static sortTasks(tasks: TaskWithIcon[], lockedLast: boolean): TaskWithIcon[] {
    const flatLevels = Utils.flatArray(TasksService.splitToLevels(tasks));
    if (!lockedLast) {
      return flatLevels;
    }
    const locked: TaskWithIcon[] = [];
    const unlocked = flatLevels.filter((task) => {
      if (task.state === "locked") {
        locked.push(task);
        return false;
      }
      return true;
    });

    return [...unlocked, ...locked];
  }

  public static splitToLevels(tasks: TaskWithIcon[], saveTaskMap?: TasksMap): TaskWithIcon[][] {
    if (typeof saveTaskMap === "undefined") {
      saveTaskMap = {};
    }
    TasksService.createTasksMap(tasks, saveTaskMap);
    const taskLevels: TasksLevels = {};
    const levels: TaskWithIcon[][] = [];
    const levelsCache: TasksLevelMap = {};

    tasks.forEach((t) => TasksService.getTaskLevel(saveTaskMap!, t, levelsCache, taskLevels));
    const maxLevel = Math.max(...Object.keys(taskLevels).map((x) => Number(x)));
    for (let level = 0; level < maxLevel; level++) {
      levels.push(taskLevels[level]);
    }

    return levels;
  }

  public static getTaskLevel(tasksMap: TasksMap, task?: TaskWithIcon, knownLevels?: TasksLevelMap, taskLevels?: TasksLevels): number {
    if (typeof task === "undefined" || !(task.id in tasksMap)) {
      return -1;
    }
    if (typeof knownLevels === "undefined") {
      knownLevels = {};
    }
    if (task.id in knownLevels) {
      return knownLevels[task.id];
    }
    const requirementIds = [...Utils.flatArray(task.prerequisities)];
    const level = 1 + Math.max(-1, ...requirementIds
      .map((requirementId) => TasksService.getTaskLevel(tasksMap, tasksMap[requirementId], knownLevels, taskLevels))
    );
    knownLevels[task.id] = level;
    if (typeof taskLevels !== "undefined") {
      if (!(level in taskLevels)) {
        taskLevels[level] = [];
      }
      taskLevels[level].push(task);
    }
    return level;
  }

  public static createTasksMap(tasks: TaskWithIcon[], saveInto?: TasksMap): TasksMap {
    const r: TasksMap = typeof saveInto === "undefined" ? {} : saveInto;
    tasks.forEach((t) => r[t.id] = t);
    return r;
  }
}
