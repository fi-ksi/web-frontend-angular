import { Injectable } from '@angular/core';
import { BackendService, YearsService, UserService } from "../shared";
import { combineLatest, merge, Observable, of, Subject } from "rxjs";
import { filter, map, mergeMap, shareReplay, take, tap } from "rxjs/operators";
import { TaskWithIcon, WaveDetails } from "../../models";
import { Task, Wave } from "src/api";
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

  private static readonly CACHE_MAX_SIZE = 100;
  private readonly cache: {[taskId: number]: TaskWithIcon} = {};
  private readonly taskUpdatesSubject: Subject<TaskWithIcon> = new Subject<TaskWithIcon>();
  private readonly taskUpdates$ = this.taskUpdatesSubject.asObservable();

  constructor(private backend: BackendService, private year: YearsService, private userService: UserService) {
    this.tasks$ = merge(
      backend.user$.pipe(map(() => this.year.selected)),
      year.selected$
    ).pipe(
      mergeMap((year) => this.backend.http.tasksGetAll(year?.id)),
      map((response) => response.tasks.map((task) => TasksService.taskAddIcon(task))),
      tap((tasks) => {
        /*
         * Empty enough space in cache for new tasks
         */
        const cachedKeys = Object.keys(this.cache);
        let firstKey;
        while (cachedKeys.length + tasks.length > TasksService.CACHE_MAX_SIZE && (firstKey = cachedKeys.shift())) {
          delete this.cache[Number(firstKey)];
        }

        /*
        Save new tasks into cache
         */
        for (let i = 0; i < tasks.length && i < TasksService.CACHE_MAX_SIZE; i++) {
          this.cache[tasks[i].id] = tasks[i];
        }
      }),
      shareReplay(1)
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

    // flush cache on login change
    this.userService.isLoggedIn$
      .subscribe(() => Object.keys(this.cache).forEach((key) => delete this.cache[Number(key)]));
  }

  /**
   * Gets a tasks, fires repeatedly after every cache update
   * @param taskId if of the requested task
   * @param refreshCache if set to true, then the data is taken from backend even if already cached
   */
  public getTask(taskId: number, refreshCache = false): Observable<TaskWithIcon> {
    return merge(
      this.getTaskOnce(taskId, refreshCache),
      this.taskUpdates$.pipe(filter((update) => update !== undefined && update?.id === taskId))
    );
  }

  /**
   * Requests a task, firing only once
   * @param taskId id of the requested task
   * @param refreshCache if set to true, then the data is taken from backend even if already cached
   * @param publishUpdate if set to false then no task update subscribers are notified upon update
   */
  public getTaskOnce(taskId: number, refreshCache = false, publishUpdate = true): Observable<TaskWithIcon> {
    if (!refreshCache && taskId in this.cache) {
      return of(this.cache[taskId]);
    }

    return this.backend.http.tasksGetSingle(taskId).pipe(
      map((response) => TasksService.taskAddIcon(response.task)),
      tap((task) =>  {
        /*
        Empty space in the cache
         */
        const cachedKeys = Object.keys(this.cache);
        let firstKey;
        while (cachedKeys.length >= TasksService.CACHE_MAX_SIZE && (firstKey = cachedKeys.shift())) {
          delete this.cache[Number(firstKey)];
        }

        /*
          Save the task into cache
        */
        this.cache[task.id] = task;
        if (publishUpdate) {
          this.taskUpdatesSubject.next(task);
        }
      }),
      take(1),
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
    for (let level = 0; level <= maxLevel; level++) {
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

  private static taskAddIcon(task: Task): TaskWithIcon {
    return {
      ...task,
      icon: Utils.getTaskIconURL(task),
    };
  }
}
