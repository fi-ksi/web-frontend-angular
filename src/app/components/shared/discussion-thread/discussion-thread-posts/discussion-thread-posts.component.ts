import { Component, OnInit, ChangeDetectionStrategy, Input } from '@angular/core';
import { PostsMap } from "../../../../models";
import { Post } from "../../../../../api";

@Component({
  selector: 'ksi-discussion-thread-posts',
  templateUrl: './discussion-thread-posts.component.html',
  styleUrls: ['./discussion-thread-posts.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DiscussionThreadPostsComponent implements OnInit {
  @Input()
  postId: number;

  @Input()
  posts: PostsMap;

  @Input()
  parent: Post | null = null;

  post: Post;

  constructor() { }

  ngOnInit(): void {
    this.post = this.posts[this.postId];
  }

}
