import { Injectable } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { BackendService, YearsService, UserService } from '../shared';
import { combineLatest, merge, Observable, of, Subject } from 'rxjs';
import { filter, map, mapTo, mergeMap, shareReplay, take, tap } from 'rxjs/operators';
import { IWave, TaskWithIcon, WaveDetails } from '../../models';
import { Feedback, Task, Wave } from 'src/api/backend';
import { Cache, Utils } from '../../util';
import { environment } from '../../../environments/environment';

type TasksLevelMap = { [taskId: number]: number };
type TasksMap = { [taskId: number]: TaskWithIcon };
type TasksLevels = { [level: number]: TaskWithIcon[] };

@Injectable({
  providedIn: 'root'
})
export class TasksService {
  readonly waveDetails$: Observable<WaveDetails[]>;
  readonly waves$: Observable<Wave[]>;
  readonly tasks$: Observable<TaskWithIcon[]>;

  public readonly cacheWaves = new Cache<number, Wave>(
    TasksService.CACHE_MAX_SIZE,
    (x) => this.backend.http.wavesGetSingle(x).pipe(map((r) => r.wave))
  )

  public readonly cacheFeedbacks = new Cache<number, Feedback>(
    TasksService.CACHE_MAX_SIZE,
    (x) => this.backend.http.feedbackGetSingle(x).pipe(map((x) => x.feedback))
  );

  private static readonly CACHE_MAX_SIZE = 100;
  private readonly cache: { [taskId: number]: TaskWithIcon } = {};
  private readonly cacheRequirementsState = new Cache<number, { [requirementId: number]: string }>(
    1000,
    () => of({})
  );
  private readonly taskUpdatesSubject: Subject<TaskWithIcon> = new Subject<TaskWithIcon>();
  private readonly taskUpdates$ = this.taskUpdatesSubject.asObservable();

  constructor(
    private backend: BackendService,
    private year: YearsService,
    private userService: UserService,
    private sanitizer: DomSanitizer,
  ) {
    this.tasks$ = merge(
      backend.user$.pipe(map(() => this.year.selected)),
      year.selected$
    ).pipe(
      mergeMap((year) => this.backend.http.tasksGetAll(year?.id)),
      mergeMap((response) =>
        combineLatest(response.tasks.map((task) => this.taskAddIcon(task))),
      ),
      tap((tasks) => {
        tasks.forEach((task) => this.updateTask(task));
      }),
      shareReplay(1)
    );

    this.waves$ = merge(
      backend.user$.pipe(map(() => this.year.selected)),
      year.selected$
    ).pipe(
      mergeMap((year) => this.backend.http.wavesGetAll(year?.id)),
      map((response) => {
        const {waves} = response;
        waves.sort((a, b) => a.index - b.index);
        return waves;
      }),
      tap((waves) => waves.forEach((wave) => this.cacheWaves.set(wave.id, wave)))
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
      }),
      map((waves) => this.mergeSimilarWaveDetails(waves)),
      shareReplay(1)
    );

    // flush cache on login change
    this.userService.isLoggedIn$
      .subscribe(() => {
        Object.keys(this.cache).forEach((key) => delete this.cache[Number(key)]);
        this.cacheRequirementsState.flush();
      });
  }

  public mergeSimilarWaves<T extends IWave>(waves: T[]): T[] {
    if (!environment.mergeSimilarWaves) {
      return waves;
    }

    const similarWaves: {[caption: string]: T[]} = {};
    waves.forEach((w) => {
      const similarName = Object.keys(similarWaves).find((name) => w.caption.startsWith(`${name} -- `));
      if (similarName) {
        similarWaves[similarName].push(w);
      } else {
        similarWaves[w.caption] = [];
      }
    });

    return waves
      .filter((w) => w.caption in similarWaves)
      .map((w) => {
        const similar = similarWaves[w.caption];
        w.$mergedWaveIds = new Set(similar.map((w2) => w2.id));
        w.tasks_cnt += similar.map((w2) => w2.tasks_cnt).reduce((p, a) => p + a, 0);
        w.sum_points += similar.map((w2) => w2.sum_points).reduce((p, a) => p + a, 0);
        return w;
      });
  }

  public mergeSimilarWaveDetails(waves: WaveDetails[]): WaveDetails[] {
    const mergedWaveIDs = new Set<number>();

    return this.mergeSimilarWaves(waves)
      .map((wave) => {
        if (wave.$mergedWaveIds !== undefined) {
          wave.$mergedWaveIds.forEach((waveId) => {
            mergedWaveIDs.add(waveId);
            const similarWave = waves.find((x) => x.id == waveId);
            if (similarWave === undefined) {
              return;
            }
            wave.tasks.push(...similarWave.tasks);
          });
        }

        return wave;
      }).filter((wave) => !mergedWaveIDs.has(wave.id));
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
      map((response) => this.taskAddIcon(response.task)),
      mergeMap((taskWithIcon$) => taskWithIcon$),
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
    environment.logger.debug(
      `[TASK] updating task cache for task ${task.id}, publish update: ${publishUpdate}`,
    );

    this.taskAddIcon(task).subscribe((taskWithIcon) => {
      /*
        Empty space in the cache
      */
      const cachedKeys = Object.keys(this.cache);
      let firstKey;
      while (
        cachedKeys.length >= TasksService.CACHE_MAX_SIZE &&
        (firstKey = cachedKeys.shift())
      ) {
        const key = Number(firstKey);
        delete this.cache[key];
      }

      /*
        Save the task into cache
      */
      this.cache[taskWithIcon.id] = taskWithIcon;
      if (publishUpdate) {
        this.taskUpdatesSubject.next(taskWithIcon);
      }
    });
  }

  /**
   * Watches for changes in the state of the requirements of the task
   * @param task task to which requirements watch for
   * @return Observable<true> emits whenever the state the requirements has changed from the initial state
   */
  public watchTaskRequirementsStateChange(task: TaskWithIcon): Observable<true> {
    // watch tasks requirements for state change
    const requirementsIDs = Utils.flatArray(task.prerequisities);

    return combineLatest(requirementsIDs.map((watchedTaskId) => this.getTask(watchedTaskId))).pipe(
      filter((tasks: TaskWithIcon[]) => {
        let requirementsState: { [requirementId: number]: string; };

        if (this.cacheRequirementsState.contains(task.id)) {
          environment.logger.debug(`[TASK] requirement watch cache reused for task ${task.id}`);
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          requirementsState = this.cacheRequirementsState.getSync(task.id)!;
        } else {
          environment.logger.debug(`[TASK] requirement watch cache init for task ${task.id}`);
          requirementsState = {};
          this.cacheRequirementsState.set(task.id, requirementsState);
        }

        const changed: number[] = [];

        for (const requirement of tasks) {
          // compare states for changes
          const savedState = requirementsState[requirement.id];
          environment.logger.debug(`[TASK] requirement ${requirement.id} of task ${task.id} was ${savedState} and now is ${requirement.state}`);
          if (savedState !== requirement.state) {
            requirementsState[requirement.id] = requirement.state;
            if (savedState !== undefined) {
              changed.push(requirement.id);
            }
          }
        }

        const isChange = changed.length > 0;
        if (isChange) {
          environment.logger.debug(`[TASK] requirement of task ${task.id} have changed their state: ${changed}`);
        }
        return isChange;
      }),
      mapTo(true));
  }


  public static sortTasks(tasks: TaskWithIcon[], lockedLast: boolean): TaskWithIcon[] {
    const flatLevels = Utils.flatArray(TasksService.splitToLevels(tasks));
    if (!lockedLast) {
      return flatLevels;
    }
    const locked: TaskWithIcon[] = [];
    const unlocked = flatLevels.filter((task) => {
      if (task.state === 'locked') {
        locked.push(task);
        return false;
      }
      return true;
    });

    return [...unlocked, ...locked];
  }

  public static splitToLevels(tasks: TaskWithIcon[], saveTaskMap?: TasksMap): TaskWithIcon[][] {
    if (typeof saveTaskMap === 'undefined') {
      saveTaskMap = {};
    }
    TasksService.createTasksMap(tasks, saveTaskMap);
    const taskLevels: TasksLevels = {};
    const levels: TaskWithIcon[][] = [];
    const levelsCache: TasksLevelMap = {};

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    tasks.forEach((t) => TasksService.getTaskLevel(saveTaskMap!, t, levelsCache, taskLevels));
    const maxLevel = Math.max(...Object.keys(taskLevels).map((x) => Number(x)));
    for (let level = 0; level <= maxLevel; level++) {
      levels.push(taskLevels[level]);
    }

    return levels;
  }

  public static getTaskLevel(tasksMap: TasksMap, task?: TaskWithIcon, knownLevels?: TasksLevelMap, taskLevels?: TasksLevels): number {
    if (typeof task === 'undefined' || !(task.id in tasksMap)) {
      return -1;
    }
    if (typeof knownLevels === 'undefined') {
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
    if (typeof taskLevels !== 'undefined') {
      if (!(level in taskLevels)) {
        taskLevels[level] = [];
      }
      taskLevels[level].push(task);
    }
    return level;
  }

  public static createTasksMap(tasks: TaskWithIcon[], saveInto?: TasksMap): TasksMap {
    const r: TasksMap = typeof saveInto === 'undefined' ? {} : saveInto;
    tasks.forEach((t) => r[t.id] = t);
    return r;
  }


  private taskAddIcon(task: Task): Observable<TaskWithIcon> {
    return this.backend.http
      .taskContent2GetSingle(
        `icon/${task.state}${task.picture_suffix}`,
        task.id.toString(),
      )
      .pipe(
        mergeMap((icon) => {
          const url = URL.createObjectURL(icon);
          // icon is safe
          const safeUrl = this.sanitizer.bypassSecurityTrustUrl(url);

          return of({
            ...task,
            icon: safeUrl as string,
          });
        }),
      );
  }
}
