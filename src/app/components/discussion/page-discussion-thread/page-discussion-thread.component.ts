import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { BackendService, IconService, KsiTitleService } from '../../../services';
import { ActivatedRoute } from '@angular/router';
import { distinctUntilChanged, filter, map, mergeMap, shareReplay, tap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { Thread } from '../../../../api/backend';

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

  rootPost$: Observable<number | null>;

  constructor(
    private backend: BackendService, private route: ActivatedRoute, private title: KsiTitleService,
    public icon: IconService
  ) { }

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
    );

    this.rootPost$ = this.route.fragment.pipe(
      map((fragment) => fragment !== null ? Number(fragment) : fragment),
      filter((fragment) => fragment === null || !isNaN(fragment)),
      distinctUntilChanged(),
      shareReplay(1)
    );
  }
}
