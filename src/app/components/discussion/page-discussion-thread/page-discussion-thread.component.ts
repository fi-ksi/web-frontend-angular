import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { BackendService, KsiTitleService } from "../../../services";
import { ActivatedRoute } from "@angular/router";
import { map, mergeMap, tap } from "rxjs/operators";
import { combineLatest, Observable } from "rxjs";
import { ThreadDetailResponse } from "../../../../api";

@Component({
  selector: 'ksi-page-discussion-thread',
  templateUrl: './page-discussion-thread.component.html',
  styleUrls: ['./page-discussion-thread.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PageDiscussionThreadComponent implements OnInit {
  detail$: Observable<ThreadDetailResponse>;

  constructor(private backend: BackendService, private route: ActivatedRoute, private title: KsiTitleService) { }

  ngOnInit(): void {
    this.detail$ = this.route.params.pipe(
      map((params) => Number(params.id)),
      mergeMap(
        (threadId) => combineLatest([
          this.backend.http.threadsGetSingle(threadId).pipe(map((response) => response.thread)),
          this.backend.http.threadDetailsGetSingle(threadId)
        ])
      ),
      tap(([head, _]) => {
        this.title.subtitle = head.title;
      }),
      map(([_, detail]) => detail)
    )
  }
}
