import { Component, OnInit, ChangeDetectionStrategy, ViewChild, TemplateRef, OnDestroy } from '@angular/core';
import {
  BackendService,
  IconService,
  KsiTitleService,
  ModalService,
  TasksService,
  WindowService
} from "../../../services";
import { ActivatedRoute, Router } from "@angular/router";
import { catchError, distinctUntilChanged, filter, map, mergeMap, shareReplay, tap } from "rxjs/operators";
import { combineLatest, Observable, of, throwError } from "rxjs";
import { OpenedTemplate, TaskFullInfo } from "../../../models";
import { UserService } from "../../../services";
import { ROUTES } from "../../../../routes/routes";

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

  private openedModal: OpenedTemplate | null = null;

  private static readonly ERR_LOGIN_DENIED = 'login-required-but-denied';

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
  ) {
  }

  ngOnInit(): void {
    this.task$ = this.route.params.pipe(
      map((params) => Number(params.id)),
      mergeMap((taskId: number) => this.tasks.getTask(taskId)),
      mergeMap((task) => {
        if (task.state !== "locked") {
          return of(task);
        }
        // Force login if the task is locked
        return this.user.requestLogin$.pipe(mergeMap((loginOk) => {
          if (!loginOk) {
            return throwError(PageTaskComponent.ERR_LOGIN_DENIED);
          }
          return this.tasks.getTask(task.id, true);
        }))
      }),
      mergeMap((task) => combineLatest([
        of(task),
        this.backend.http.taskDetailsGetSingle(task.id)
      ])),
      map(([head, detail]) => ({head, detail})),
      tap((task) => {
        this.title.subtitle = task.head.title;
      }),
      catchError((err) => {
        if (err === PageTaskComponent.ERR_LOGIN_DENIED) {
          this.router.navigate(['/', ROUTES.tasks]).then();
          return of(null);
        }
        throw err;
      }),
      shareReplay(1)
    );

    const fragmentMap: { [fragment: string]: TemplateRef<unknown> } = {
      'solution': this.templateBodySolution,
      'discussion': this.templateBodyDiscussion,
      'assigment': this.templateBodyAssigment
    };

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
  }

  ngOnDestroy(): void {
    this.openModal(null);
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
      const title = body == this.templateBodyDiscussion ? 'tasks.discussion' : 'tasks.solution';
      const modal = this.openedModal = this.modal.showModalTemplate(body, title, {class: 'modal-full-page'});
      const sub = this.openedModal.visible$.pipe(filter((visible) => !visible)).subscribe(() => {
        if (this.openedModal === modal) {
          this.router.navigate([], {fragment: undefined}).then();
        }
        sub.unsubscribe();
      });
    }
  }
}
