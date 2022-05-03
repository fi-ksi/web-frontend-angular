import { Injectable } from '@angular/core';
import { BackendService, YearsService, UserService } from "../shared";
import { combineLatest, merge, Observable, of, Subject } from "rxjs";
import { filter, map, mergeMap, shareReplay, take, tap } from "rxjs/operators";
import { TaskWithIcon, WaveDetails } from "../../models";
import { Task, Wave } from "src/api";
import { Utils } from "../../util";
import { environment } from "../../../environments/environment";

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
        tasks.forEach((task) => this.updateTask(task))
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
      tap((task) => this.updateTask(task, publishUpdate)),
      take(1),
    );
  }

  /**
   * Update task in cache
   * @param task new task value
   * @param publishUpdate if set to false then no task update subscribers are notified upon update
   */
  public updateTask(task: Task, publishUpdate = true): void {
    const taskWithIcon = TasksService.taskAddIcon(task);

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
    this.cache[taskWithIcon.id] = taskWithIcon;
    if (publishUpdate) {
      this.taskUpdatesSubject.next(taskWithIcon);
    }
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

    /*
    Optimize and minimize possible task crossings
    For each task in every level compute:
    - how many crossings occur
    - how many crossing occur if the task is switched with a task to its left
    If the new crossing count is smaller than the previous one, repeat whole process until no further
    minimization is possible
     */
    const crossingOptimizationsStart = Date.now();
    levels.forEach((level, levelIndex) => {
      if (levelIndex === 0) {
        // skip first level because it has no parents
        return;
      }

      // change is set to false
      let change = true;
      while (change) {
        change = false;
        for (let taskIndex = 1; taskIndex < level.length; taskIndex++) {
          // create new level with the task switched with the previous one
          const levelNew = [...level];
          levelNew[taskIndex] = level[taskIndex - 1];
          levelNew[taskIndex - 1] = level[taskIndex];

          const crossingsCur = TasksService.getLevelCrossingsCount(level, levels[levelIndex - 1]);
          const crossingNew =  TasksService.getLevelCrossingsCount(levelNew, levels[levelIndex - 1]);

          if (crossingNew < crossingsCur) {
            change = true;
            // new crossings count is smaller, apply the change
            level[taskIndex] = levelNew[taskIndex];
            level[taskIndex - 1] = levelNew[taskIndex - 1];
          }
        }
      }
    });

    environment.logger.debug('[TASKS]', `optimization of ${tasks.length} tasks took ${Date.now() - crossingOptimizationsStart}ms`);

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

  /**
   * Computes how many crosses of task prerequisites are present in this level order
   * @param level current level to count crossing count for
   * @param parent parent level of this level
   * @private
   */
  private static getLevelCrossingsCount(level: TaskWithIcon[], parent: TaskWithIcon[]): number {
    const parentIds = parent.map((t) => t.id);

    let globalCrosses = 0;

    level.forEach((task, taskI) => {
      let taskCrosses = 0;

      // compute how many previous tasks in this level have parent with higher index than this task
      for (let task2I = 0; task2I < taskI; task2I ++) {
        const task2 = level[task2I];
        const task2ParentIndexes = Utils
          .flatArray(task2.prerequisities)
          .map((id) => parentIds.indexOf(id))
          .filter((id) => id !== -1);
        taskCrosses += task2ParentIndexes.filter((index) => index > taskI).length;
      }

      // compute how many following tasks in this level have parent with lower index than this task
      for (let task2I = level.length - 1; task2I > taskI; task2I --) {
        const task2 = level[task2I];
        const task2ParentIndexes = Utils
          .flatArray(task2.prerequisities)
          .map((id) => parentIds.indexOf(id))
          .filter((id) => id !== -1);
        taskCrosses += task2ParentIndexes.filter((index) => index < taskI).length;
      }

      globalCrosses += taskCrosses;
    });

    return globalCrosses;
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
