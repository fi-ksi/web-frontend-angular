import { Component, OnInit, ChangeDetectionStrategy, Input, OnDestroy } from '@angular/core';
import { ThreadDetailResponse } from "../../../../api";
import { PostsMap } from "../../../models";
import { BehaviorSubject, combineLatest, Observable, Subscription } from "rxjs";
import { BackendService, ModalService, WindowService, UserService } from "../../../services";
import { filter, map, mergeMap, shareReplay, take } from "rxjs/operators";
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
export class DiscussionThreadComponent implements OnInit, OnDestroy {
  @Input()
  threadId: number;

  @Input()
  rootPost: number | null = null;

  thread$: Observable<ThreadDetailsWithPostsMap>;

  maxPostsDepth$: Observable<number>;

  private readonly refreshSubject = new BehaviorSubject<unknown>(null);
  private readonly refresh$ = this.refreshSubject.asObservable();

  private subs: Subscription[] = [];

  constructor(
    private backend: BackendService,
    private window: WindowService,
    private modal: ModalService,
    private user: UserService
  ) { }

  ngOnInit(): void {
    this.thread$ = this.user.isLoggedIn$.pipe(
      mergeMap(() => this.refresh$),
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

    // mark thread as visited when user is logged in
    this.subs.push(
      this.refresh$.pipe(
        mergeMap(() => this.user.isLoggedIn$),
        filter((loggedIn) => loggedIn)
      ).subscribe(() => {
        this.backend.http.threadsMarkVisited(this.threadId).subscribe();
      })
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

  ngOnDestroy(): void {
    this.subs.forEach((s) => s.unsubscribe());
  }

  onPostsModified(): void {
    environment.logger.debug('posts modified');
    this.refreshSubject.next(null);
  }

  openNewPostModal(threadId: number): void {
    this.user.afterLogin$.subscribe(() => {
      const modal = this.modal.showPostReplyModal(threadId);
      modal.visible$.pipe(
        filter((visible) => !visible),
        take(1)
      ).subscribe(() => {
        if (modal.component.instance.replied) {
          environment.logger.debug('new post created');
          this.refreshSubject.next(null);
        }
      })
    });
  }
}
