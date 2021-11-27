import { Component, OnInit, ChangeDetectionStrategy, Input } from '@angular/core';
import { ThreadDetailResponse } from "../../../../api";
import { PostsMap } from "../../../models";
import { combineLatest, Observable } from "rxjs";
import { BackendService, WindowService } from "../../../services";
import { map } from "rxjs/operators";

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

  constructor(private backend: BackendService, private window: WindowService) { }

  ngOnInit(): void {
    this.thread$ = this.backend.http.threadDetailsGetSingle(this.threadId).pipe(
      map((thread) => {
        const posts: PostsMap = {};
        thread.posts.forEach((post) => posts[post.id] = post);
        return {
          thread,
          posts
        }
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
}
