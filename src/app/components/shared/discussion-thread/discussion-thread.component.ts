import { Component, OnInit, ChangeDetectionStrategy, Input } from '@angular/core';
import { ThreadDetailResponse } from "../../../../api";
import { PostsMap } from "../../../models";
import { BehaviorSubject, combineLatest, Observable } from "rxjs";
import { BackendService, WindowService } from "../../../services";
import { map, mergeMap, shareReplay } from "rxjs/operators";
import { environment } from "../../../../environments/environment";

interface ThreadDetailsWithPostsMap {
  thread: ThreadDetailResponse,
  posts: PostsMap,
}

@Component({
  selector: 'ksi-discussion-thread',
  templateUrl: './discussion-thread.component.html',
  styleUrls: ['./discussion-thread.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DiscussionThreadComponent implements OnInit {
  @Input()
  threadId: number;

  @Input()
  rootPost: number | null = null;

  thread$: Observable<ThreadDetailsWithPostsMap>;

  maxPostsDepth$: Observable<number>;

  private readonly refreshSubject = new BehaviorSubject<unknown>(null);
  private readonly refresh$ = this.refreshSubject.asObservable();

  constructor(private backend: BackendService, private window: WindowService) { }

  ngOnInit(): void {
    this.thread$ = this.refresh$.pipe(
      mergeMap(() => this.backend.http.threadDetailsGetSingle(this.threadId)),
      map((thread) => {
        const posts: PostsMap = {};
        thread.posts.forEach((post) => posts[post.id] = post);
        return {
          thread,
          posts
        }
      }),
      shareReplay(1)
    );

    this.maxPostsDepth$ = combineLatest([this.window.isMobileSmall$, this.window.isMobile$]).pipe(
      map(([isMobileSmall, isMobile]) => {
        if (isMobileSmall) {
          return 1;
        }
        if (isMobile) {
          return 2;
        }
        return 4;
      })
    );
  }

  onPostsModified(): void {
    environment.logger.debug('posts modified');
    this.refreshSubject.next(null);
  }
}
