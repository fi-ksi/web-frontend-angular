import { Component, OnInit, ChangeDetectionStrategy, Input } from '@angular/core';
import { PostsMap } from "../../../../models";
import { Post } from "../../../../../api";
import { StorageService } from "../../../../services/shared/storage.service";
import { IconService } from "../../../../services";

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

  expanded: boolean;

  private storage: StorageService;

  private static readonly EXPANDED_DEFAULT = true;

  constructor(private storageRoot: StorageService, public icon: IconService) { }

  ngOnInit(): void {
    this.storage = this.storageRoot.open(['discussion', 'post', `${this.postId}`]);
    this.expanded = this.storage.get<boolean>('expanded', DiscussionThreadPostsComponent.EXPANDED_DEFAULT)!;
    this.post = this.posts[this.postId];
  }

  setExpanded(value: boolean) {
    this.expanded = value;
    this.storage.set<boolean>('expanded', value, DiscussionThreadPostsComponent.EXPANDED_DEFAULT);
  }
}

