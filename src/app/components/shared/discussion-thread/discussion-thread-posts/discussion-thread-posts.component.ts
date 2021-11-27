import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  Input,
  ViewChild,
  TemplateRef,
  Output,
  EventEmitter,
  ChangeDetectorRef
} from '@angular/core';
import { OpenedTemplate, PostsMap } from "../../../../models";
import { Post } from "../../../../../api";
import { StorageService } from "../../../../services/shared/storage.service";
import { BackendService, IconService, ModalService } from "../../../../services";
import { filter, tap } from "rxjs/operators";
import { FormControl, Validators } from "@angular/forms";
import { Router } from "@angular/router";

@Component({
  selector: 'ksi-discussion-thread-posts',
  templateUrl: './discussion-thread-posts.component.html',
  styleUrls: ['./discussion-thread-posts.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DiscussionThreadPostsComponent implements OnInit {
  get posts(): PostsMap {
    return this._posts;
  }

  @Input()
  set posts(value: PostsMap) {
    this._posts = value;
    if (typeof this.postId !== "undefined") {
      this.post = this._posts[this.postId];
    }
    this.cd.markForCheck();
  }

  @Input()
  postId: number;

  @Input()
  threadId: number | null = null;

  @Input()
  level = 0;

  @Input()
  maxLevel: number | null = null;

  private _posts: PostsMap;

  @Input()
  parent: Post | null = null;

  @Input()
  allowActions = true;

  @Input()
  allowExpansion = true;

  @Output()
  postsModified = new EventEmitter<void>();

  post: Post;

  expanded: boolean;

  maxLevelReached: boolean;

  @ViewChild('modalReply', {static: true})
  templateModalReply: TemplateRef<unknown>;

  modalReply: OpenedTemplate | null = null;

  reply = new FormControl(null, [Validators.required]);

  private storage: StorageService;

  private static readonly EXPANDED_DEFAULT = true;

  constructor(
    private storageRoot: StorageService,
    public icon: IconService,
    private backend: BackendService,
    private modal: ModalService,
    private router: Router,
    private cd: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.storage = this.storageRoot.open(['discussion', 'post', `${this.postId}`]);
    this.expanded = this.storage.get<boolean>('expanded', DiscussionThreadPostsComponent.EXPANDED_DEFAULT)!;
    this.post = this._posts[this.postId];
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
      this.reply.setValue(null);
      this.modalReply = this.modal.showModalTemplate(this.templateModalReply, 'discussion-thread.post.reply',
        {class: 'modal-full-page modal-post-reply'});
    });
  }

  saveReply(): void {
    if (!this.reply.valid) {
      return;
    }
    this.reply.disable();

    this.backend.http.postsCreateNew({
      post: {
        thread: this.threadId!,
        parent: this.post.id,
        body: this.reply.value
      }
    }).subscribe(() => {
      this.postsModified.next();
      this.router.navigate([], {fragment: `${this.post.id}`}).then();
      this.modalReply?.template.instance.close();
    });
  }

  propagateModified(): void {
    this.postsModified.next();
  }
}
