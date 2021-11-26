import { Component, OnInit, ChangeDetectionStrategy, Input } from '@angular/core';
import { ThreadDetailResponse } from "../../../../api";
import { PostsMap } from "../../../models";
import { Observable } from "rxjs";
import { BackendService } from "../../../services";
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

  thread$: Observable<ThreadDetailsWithPostsMap>;

  constructor(private backend: BackendService) { }

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
  }
}
