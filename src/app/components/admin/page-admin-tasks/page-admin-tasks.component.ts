import { Component, OnInit, ChangeDetectionStrategy, ViewChild, TemplateRef } from '@angular/core';
import {
  AdminTaskService,
  BackendService,
  IconService,
  KsiTitleService, ModalService,
  RoutesService,
  TasksService,
  YearsService
} from '../../../services';
import { AdminTask, AdminTaskDeployResponse, Wave } from '../../../../api/backend';
import {BehaviorSubject, combineLatest, Observable, of, Subject, timer} from 'rxjs';
import {distinctUntilChanged, filter, map, mergeMap, shareReplay, take, tap} from 'rxjs/operators';
import { IAdminTask } from '../../../models';
import {SubscribedComponent, Utils} from '../../../util';

interface WaveTasks {
  shown: boolean,
  wave: Wave,
  tasks: Observable<IAdminTask>[]
}

@Component({
  selector: 'ksi-page-admin-tasks',
  templateUrl: './page-admin-tasks.component.html',
  styleUrls: ['./page-admin-tasks.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PageAdminTasksComponent extends SubscribedComponent implements OnInit {
  @ViewChild('modalDeployLog', {static: true})
  modalDeployLog: TemplateRef<unknown>;

  private readonly deployLogSubject = new BehaviorSubject<AdminTaskDeployResponse | null>(null);
  readonly deployLog$ = this.deployLogSubject.asObservable();

  private readonly taskDeployQueue: {task: AdminTask, button: HTMLButtonElement}[] = [];

  waveTasks$: Observable<WaveTasks[]>;
  waveTasksShown$: Observable<WaveTasks[]>;

  waveFilterSubj: Subject<number | null> = new BehaviorSubject<number | null>(null);
  readonly waveFilter$: Observable<number | null> = this.waveFilterSubj.asObservable();

  constructor(
    private years: YearsService,
    private title: KsiTitleService,
    private tasks: TasksService,
    public icon: IconService,
    public routes: RoutesService,
    private backend: BackendService,
    private modal: ModalService,
    private adminTasks: AdminTaskService
  ) {
    super();
  }

  ngOnInit(): void {

    const allWaveTasks$ = this.years.adminTasks$.pipe(
      mergeMap((tasks) => {
        const waveIdTasks: { [waveId: number]: Observable<IAdminTask>[] } = {};
        tasks.forEach((task) => {
          this.adminTasks.tasksCache.set(task.id, this.adminTasks.enrichTask(this.adminTasks.enrichTask(task)));
          if (!(task.wave in waveIdTasks)) {
            waveIdTasks[task.wave] = [];
          }
          waveIdTasks[task.wave].push(this.adminTasks.tasksCache.get(task.id));
        });

        const waves$: Observable<Wave[]> = combineLatest(
          Object.keys(waveIdTasks).map((waveId) => this.tasks.cacheWaves.get(Number(waveId)))
        );
        const waveTasks$: Observable<Observable<IAdminTask>[][]> = of(
          Object.keys(waveIdTasks).map((waveId) => waveIdTasks[Number(waveId)])
        );

        return combineLatest([waves$, waveTasks$]);
      }),
      map(([waves, waveTasks]) => {
        return waves.map((wave, i) => ({wave, tasks: waveTasks[i]}));
      }),
      map((waveTasks) => {
        return waveTasks.sort((a, b) => b.wave.id - a.wave.id);
      }),
      shareReplay(1)
    );

    this.waveTasks$ = combineLatest([allWaveTasks$, this.waveFilter$]).pipe(
      distinctUntilChanged(),
      map(([waveTasks, waveFilter]) => {
        return waveTasks.map((waveTask) => {
          return {
            shown: waveFilter === null || waveTask.wave.id === waveFilter,
            wave: waveTask.wave,
            tasks: waveTask.tasks
          };
        });
      }),
      shareReplay(1)
    );

    this.waveTasksShown$ = this.waveTasks$.pipe(
      map((waveTasks) => waveTasks.filter((waveTask) => waveTask.shown))
    );
    this.title.subtitle = 'admin.root.tasks.title';
  }

  requestTaskDeploy(task: AdminTask, event: MouseEvent): void {
    const button = event.target as HTMLButtonElement;
    button.disabled = true;

    this.scheduleTaskDeploy(task, button).then();
  }

  private async scheduleTaskDeploy(task: AdminTask, button: HTMLButtonElement): Promise<void> {
    this.taskDeployQueue.push({ task, button });
    if (this.taskDeployQueue.length > 1) {
      // the deployment is already running
      return;
    }

    while (this.taskDeployQueue.length > 0) {
      const { task, button } = this.taskDeployQueue[0];

      Utils.hideButton(button, 2000);

      await new Promise((resolve) => {
        this.backend.http.adminTaskDeploySingle(task.id).pipe(take(1)).subscribe(() => {
          // Periodically listen to deploy status changes and if the deployment ends with an error, show the deployment log
          const s = timer(100, 1500).pipe(
            mergeMap(() => this.adminTasks.tasksCache.refresh(task.id))
          ).subscribe((task) => {
            if (task.$isStableDeployState) {
              s.unsubscribe();
              resolve(null);
            }

            if (task.deploy_status === 'error') {
              this.showDeployLog(task);
            }
          });
        });
      });

      this.taskDeployQueue.shift();
    }
  }

  showDeployLog(task: AdminTask): void {
    this.deployLogSubject.next(null);
    const s = timer(100, 1500).pipe(
      mergeMap(() => this.backend.http.adminTasksGetDeploySingle(task.id))
    ).subscribe((r) => {
      this.deployLogSubject.next(r);
    });
    this.modal.showModalTemplate(
      this.modalDeployLog,
      'admin.tasks.deploy.log.title',
      {class: 'modal-full-page'}
    ).afterClose$.subscribe(() => s.unsubscribe());
  }

  mergeTask(task: IAdminTask, event: MouseEvent): void {
    this.modal.yesNo('admin.tasks.head.actions.merge.confirmation')
      .pipe(
        filter((r) => !!r),
        tap(() => Utils.hideButton(event.target as HTMLButtonElement)),
        mergeMap(() => this.backend.http.adminTaskMergeSingle(task.id)),
        mergeMap(() => this.adminTasks.tasksCache.refresh(task.id))
      )
      .subscribe();
  }
}
