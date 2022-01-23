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
import { PostsMap } from "../../../../models";
import { Post } from "../../../../../api";
import { RoutesService, StorageService } from "../../../../services";
import { BackendService, IconService, ModalService } from "../../../../services";
import { Router } from "@angular/router";
import { UserService } from "../../../../services";
import { filter, take } from "rxjs/operators";

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

  private storage: StorageService;

  private static readonly EXPANDED_DEFAULT = true;

  constructor(
    private storageRoot: StorageService,
    public icon: IconService,
    private backend: BackendService,
    private modal: ModalService,
    private router: Router,
    private cd: ChangeDetectorRef,
    private user: UserService,
    public routes: RoutesService
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
    this.user.afterLogin$.subscribe(() => {
      const modal = this.modal.showPostReplyModal(this.threadId!, this.post, this.posts);
      modal.visible$.pipe(
        filter((visible) => !visible),
        take(1)
      ).subscribe(() => {
          if (modal.component.instance.replied) {
            this.postsModified.next();
            this.router.navigate(['/discussion', `${this.threadId}`], {fragment: `${this.post.id}`}).then();
          }
        });
    });
  }

  propagateModified(): void {
    this.postsModified.next();
  }
}
