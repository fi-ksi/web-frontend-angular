import { Component, OnInit, ChangeDetectionStrategy, Input, ViewChild, TemplateRef } from '@angular/core';
import { PostsMap } from "../../../../models";
import { Post } from "../../../../../api";
import { StorageService } from "../../../../services/shared/storage.service";
import { BackendService, IconService, ModalService } from "../../../../services";
import { filter, tap } from "rxjs/operators";

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
  threadId: number | null = null;

  @Input()
  level = 0;

  @Input()
  maxLevel: number | null = null;

  @Input()
  posts: PostsMap;

  @Input()
  parent: Post | null = null;

  @Input()
  allowActions = true;

  post: Post;

  expanded: boolean;

  maxLevelReached: boolean;

  @ViewChild('modalReply', {static: true})
  modalReply: TemplateRef<unknown>;

  private storage: StorageService;

  private static readonly EXPANDED_DEFAULT = true;

  constructor(
    private storageRoot: StorageService,
    public icon: IconService,
    private backend: BackendService,
    private modal: ModalService
  ) { }

  ngOnInit(): void {
    this.storage = this.storageRoot.open(['discussion', 'post', `${this.postId}`]);
    this.expanded = this.storage.get<boolean>('expanded', DiscussionThreadPostsComponent.EXPANDED_DEFAULT)!;
    this.post = this.posts[this.postId];
    this.maxLevelReached = this.maxLevel !== null && this.level >= this.maxLevel;
  }

  setExpanded(value: boolean) {
    this.expanded = value;
    this.storage.set<boolean>('expanded', value, DiscussionThreadPostsComponent.EXPANDED_DEFAULT);
  }

  openReplyModal(): void {
    this.backend.user$.pipe(
      tap((user) => {
        if (!user) {
          this.modal.showLoginModal();
        }
      }),
      filter((user) => !!user)
    ).subscribe(() => {
      this.modal.showModalTemplate(this.modalReply, 'discussion.post.reply', {class: 'modal-full-page'});
    });
  }
}

