import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { BackendService, IconService, KsiTitleService } from "../../../services";
import { ActivatedRoute } from "@angular/router";
import { map, mergeMap, tap } from "rxjs/operators";
import { combineLatest, Observable } from "rxjs";
import { TaskFullInfo } from "../../../models";

enum Subpage {
  assigment=0, solution=1, discussion=2
}

@Component({
  selector: 'ksi-page-task',
  templateUrl: './page-task.component.html',
  styleUrls: ['./page-task.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PageTaskComponent implements OnInit {
  task$: Observable<TaskFullInfo>;
  authors$: Observable<number[]>;
  subpage$: Observable<Subpage>;

  constructor(
    private backend: BackendService,
    private route: ActivatedRoute,
    private title: KsiTitleService,
    public icon: IconService
  ) { }

  ngOnInit(): void {
    this.task$ = this.route.params.pipe(
      map((params) => Number(params.id)),
      mergeMap((taskId: number) => combineLatest([
        this.backend.http.tasksGetSingle(taskId).pipe(map((resp) => resp.task)),
        this.backend.http.taskDetailsGetSingle(taskId)
      ])),
      map(([head, detail]) => ({head, detail})),
      tap((task) => {
        this.title.subtitle = task.head.title;
      })
    );

    const fragmentMap: {[fragment: string]: Subpage} = {
      'solution': Subpage.solution,
      'discussion': Subpage.discussion
    };
    this.subpage$ = this.route.fragment.pipe(
      map((fragment) => fragmentMap[fragment || ''] || Subpage.assigment)
    );

    this.authors$ = this.task$.pipe(
      map(
        (task) => [task.head.author, task.head.co_author].filter((orgId) => orgId !== null)
      )
    );
  }
}
