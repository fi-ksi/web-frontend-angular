import { Component, OnInit, ChangeDetectionStrategy, ViewChild, ElementRef } from '@angular/core';
import { BackendService, KsiTitleService } from "../../../services";
import { ActivatedRoute } from "@angular/router";
import { map, mergeMap, tap } from "rxjs/operators";
import { combineLatest, Observable } from "rxjs";
import { TaskFullInfo } from "../../../models";
import { User } from "../../../../api";
import { Utils } from "../../../util";
import highlight from 'highlight.js';


@Component({
  selector: 'ksi-page-task',
  templateUrl: './page-task.component.html',
  styleUrls: ['./page-task.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PageTaskComponent implements OnInit {
  task$: Observable<TaskFullInfo>;
  authors$: Observable<User[]>;

  @ViewChild('article', { static: false })
  set article(content: ElementRef<HTMLElement>) {
    if (this.articleObserver) {
      this.articleObserver.disconnect();
      this.articleObserver = null;
    }
    if (!content) {
      return;
    }
    const { nativeElement } = content;
    this.articleObserver = new MutationObserver(() => {
      this.highlightCode(nativeElement);
    });
    this.articleObserver.observe(nativeElement, {
      childList: true,
      subtree: true
    });
    this.highlightCode(nativeElement);
  }

  private articleObserver: MutationObserver | null = null;

  constructor(private backend: BackendService, private route: ActivatedRoute, private title: KsiTitleService) { }

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

    this.authors$ = this.task$.pipe(mergeMap((task) => combineLatest(
      [task.head.author, task.head.co_author]
        .filter((orgId) => orgId !== null)
        .map((orgId) => {
          return this.backend.http.usersGetSingle(orgId).pipe(
            map((resp) => ({...resp.user, profile_picture: Utils.getOrgProfilePicture(resp.user)}))
          )
        })
    )));
  }

  private highlightCode(rootElement: HTMLElement) {
    rootElement.querySelectorAll('pre>code:not(.highlighted)').forEach((code) => {
      code.classList.forEach((cls) => {
        if (cls !== 'sourceCode') {
          code.classList.add(`language-${cls}`);
        }
      });
      code.classList.add('highlighted');
      highlight.highlightElement(code as HTMLElement);
    });
  }
}
