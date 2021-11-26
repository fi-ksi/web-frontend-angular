import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { BackendService, KsiTitleService } from "../../../services";
import { ActivatedRoute } from "@angular/router";
import { map, mergeMap, tap } from "rxjs/operators";
import { Observable } from "rxjs";
import { Thread } from "../../../../api";

@Component({
  selector: 'ksi-page-discussion-thread',
  templateUrl: './page-discussion-thread.component.html',
  styleUrls: ['./page-discussion-thread.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PageDiscussionThreadComponent implements OnInit {
  thread$: Observable<Thread>;

  threadId: number;

  threadTitle: string;

  constructor(private backend: BackendService, private route: ActivatedRoute, private title: KsiTitleService) { }

  ngOnInit(): void {
    this.thread$ = this.route.params.pipe(
      map((params) => Number(params.id)),
      tap((threadId) => {
        this.threadId = threadId;
      }),
      mergeMap(
        (threadId) => this.backend.http.threadsGetSingle(threadId)
      ),
      map((response) => response.thread),
      tap((head) => {
        this.title.subtitle = this.threadTitle = head.title;
      }),
    )
  }
}
