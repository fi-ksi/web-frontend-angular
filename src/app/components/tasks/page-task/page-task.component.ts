import { Component, OnInit, ChangeDetectionStrategy, ViewChild, TemplateRef, OnDestroy } from '@angular/core';
import {
  BackendService,
  IconService,
  KsiTitleService,
  ModalService, ModuleService, RoutesService,
  TasksService,
  WindowService,
  UsersCacheService
} from "../../../services";
import { ActivatedRoute, Router } from "@angular/router";
import { catchError, distinctUntilChanged, filter, map, mergeMap, shareReplay, tap } from "rxjs/operators";
import { BehaviorSubject, combineLatest, Observable, of, Subscription, throwError } from "rxjs";
import {IUser, OpenedTemplate, TaskFullInfo} from '../../../models';
import { UserService } from "../../../services";
import { environment } from "../../../../environments/environment";
import {UserScore} from '../../../../api';

@Component({
  selector: 'ksi-page-task',
  templateUrl: './page-task.component.html',
  styleUrls: ['./page-task.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PageTaskComponent implements OnInit, OnDestroy {
  task$: Observable<TaskFullInfo | null>;
  authors$: Observable<number[]>;
  subpage$: Observable<TemplateRef<unknown>>;

  @ViewChild('bodyDiscussion', {static: true})
  templateBodyDiscussion: TemplateRef<unknown>;

  @ViewChild('bodySolution', {static: true})
  templateBodySolution: TemplateRef<unknown>;

  @ViewChild('bodyAssigment', {static: true})
  templateBodyAssigment: TemplateRef<unknown>;

  @ViewChild('bodyResults', {static: true})
  templateBodyResults: TemplateRef<unknown>;

  private templateRefMapper: Map<TemplateRef<unknown>, string>;

  public userScores$: Observable<{user: IUser, score: number}[]>;

  private openedModal: OpenedTemplate | null = null;

  private static readonly ERR_LOGIN_DENIED = 'login-required-but-denied';

  private readonly refreshTaskDetailsSubject = new BehaviorSubject<void>(undefined);

  private moduleChangeSubs: Subscription[] = [];

  constructor(
    private backend: BackendService,
    private route: ActivatedRoute,
    private title: KsiTitleService,
    public icon: IconService,
    private window: WindowService,
    private modal: ModalService,
    private router: Router,
    private tasks: TasksService,
    private user: UserService,
    private module: ModuleService,
    public routes: RoutesService,
    public usersCache: UsersCacheService
  ) {
  }

  ngOnInit(): void {
    this.templateRefMapper = this.generateTemplateRefMap();

    this.task$ = this.route.params.pipe(
      map((params) => Number(params.id)),
      mergeMap((taskId: number) => this.tasks.getTaskOnce(taskId)),
      tap(() => this.unsubscribeModuleChanges()),
      mergeMap((task) => {
        if (task.state !== "locked") {
          return of(task);
        }
        // Force login if the task is locked
        return this.user.requestLogin$.pipe(mergeMap((loginOk) => {
          if (!loginOk) {
            return throwError(PageTaskComponent.ERR_LOGIN_DENIED);
          }
          return this.tasks.getTaskOnce(task.id, true);
        }))
      }),
      mergeMap((task) => combineLatest([
        of(task),
        this.refreshTaskDetailsSubject.asObservable().pipe(
          mergeMap(() => this.backend.http.taskDetailsGetSingle(task.id))
        )
      ])),
      map(([head, detail]) => ({head, detail})),
      tap((task) => {
        this.title.subtitle = task.head.title;

        // Watch for module completions and navigate to the solution if user completes this task for the first time
        if (task.head.state !== "done") {
          environment.logger.debug(`[TASK] this task is not done yet (${task.head.state})`);
          this.moduleChangeSubs.push(...task.detail.modules
            .map((module) => this.module.statusChanges(module).pipe(filter((change) => change?.result === "ok")).subscribe(() => {
              this.tasks.getTaskOnce(task.head.id, true, false).subscribe((newTask) => {
                environment.logger.debug(`[TASK] got an update of current status change, now ${newTask.state}`);
                if (newTask.state === "done") {
                  environment.logger.debug('[TASK] this task was just solved!');
                  this.refreshTaskDetailsSubject.next();
                  this.tasks.updateTask(newTask, true);
                  this.router.navigate([], {fragment: this.routes.routes.tasks.solution}).then();
                }
              });
            }))
          );
        }
      }),
      catchError((err) => {
        if (err === PageTaskComponent.ERR_LOGIN_DENIED) {
          this.router.navigate(['/', this.routes.routes.tasks._]).then();
          return of(null);
        }
        throw err;
      }),
      shareReplay(1)
    );

    const fragmentMap: { [fragment: string]: TemplateRef<unknown> } = {
      'assigment': this.templateBodyAssigment
    };
    fragmentMap[this.routes.routes.tasks.solution] = this.templateBodySolution;
    fragmentMap[this.routes.routes.tasks.discussion] = this.templateBodyDiscussion;
    fragmentMap[this.routes.routes.tasks.results] = this.templateBodyResults;

    this.subpage$ = combineLatest([
      this.route.fragment.pipe(
        // convert fragment into subpage, defaulting to assigment
        map((fragment) => fragmentMap[fragment || ''] || fragmentMap.assigment),
        distinctUntilChanged()
      ),
      this.window.isMobile$
    ]).pipe(
      map(([subpage, isMobile]) => {
        // on desktop, additional subpages are shown in modal
        // on mobile, everything is shown instead of assigment
        if (subpage !== this.templateBodyAssigment) {
          if (isMobile) {
            this.openModal(null);
            return subpage;
          } else {
            this.openModal(subpage);
            return this.templateBodyAssigment;
          }
        }
        return subpage;
      }),
      shareReplay(1)
    );

    this.authors$ = this.task$.pipe(
      map(
        (task) => task !== null ? [task.head.author, task.head.co_author].filter((orgId) => orgId !== null) : []
      )
    );

    this.userScores$ = this.task$.pipe(
      mergeMap(
        (task: TaskFullInfo | null) => {
          if (task === null){
            return of([]);
          }

          return combineLatest([
            combineLatest(task.detail.userScores.map((score: UserScore) => this.usersCache.getUser(score.id))),
            combineLatest(task.detail.userScores.map((score: UserScore) => of(score.score)))
          ]);
        }
      ), map(([users, scores]) => {
        const userScores = [];
        for (let i = 0; i < users.length; i++) {
          userScores.push({
            user: users[i], score: scores[i]
          });
        }

        return userScores;
      })
    );
  }

  ngOnDestroy(): void {
    this.openModal(null);
    this.unsubscribeModuleChanges();
  }

  private unsubscribeModuleChanges() {
    const subs = this.moduleChangeSubs;
    this.moduleChangeSubs = [];
    subs.forEach((s) => s.unsubscribe());
  }

  /**
   * Opens a new modal and closes the previous one
   * @param body template to render, if null then modal is only closed
   * @private
   */
  private openModal(body: TemplateRef<unknown> | null): void {
    if (this.openedModal) {
      this.openedModal.template.instance.close();
      this.openedModal = null;
    }
    if (body) {
      const title = this.templateRefMapper.get(body) || '';
      const modal = this.openedModal = this.modal.showModalTemplate(body, title, {class: 'modal-full-page'});
      const sub = this.openedModal.visible$.pipe(filter((visible) => !visible)).subscribe(() => {
        if (this.openedModal === modal) {
          this.router.navigate([], {fragment: undefined}).then();
        }
        sub.unsubscribe();
      });
    }
  }

  private generateTemplateRefMap(): Map<TemplateRef<unknown>, string> {
    return new Map([
      [this.templateBodyDiscussion, 'tasks.discussion'],
      [this.templateBodySolution, 'tasks.solution'],
      [this.templateBodyResults, 'tasks.results']
    ]);
  }
}
