import { Component, OnInit, ChangeDetectionStrategy, Input } from '@angular/core';
import { ThreadDetailResponse } from "../../../../api";
import { PostsMap } from "../../../models";

@Component({
  selector: 'ksi-discussion-thread',
  templateUrl: './discussion-thread.component.html',
  styleUrls: ['./discussion-thread.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DiscussionThreadComponent implements OnInit {
  @Input()
  thread: ThreadDetailResponse;

  postsMap: PostsMap;

  constructor() { }

  ngOnInit(): void {
    this.generatePostsMap();
  }

  private generatePostsMap(): void {
    this.postsMap = {};
    this.thread.posts.forEach((post) => this.postsMap[post.id] = post);
  }

}
