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
import { PostsMap } from '../../../../models';
import { Post } from '../../../../../api/backend';
import { RoutesService, StorageService } from '../../../../services';
import { BackendService, IconService, ModalService } from '../../../../services';
import { Router } from '@angular/router';
import { UserService } from '../../../../services';
import { filter, map, mergeMap } from 'rxjs/operators';
import { combineLatest, concat, Observable, of, Subject } from 'rxjs';

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
    if (typeof this.postId !== 'undefined') {
      this.post = this._posts[this.postId];
    }
    this.cd.markForCheck();
    this.refresh.next();
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

  canEdit$: Observable<boolean>;

  canDelete$: Observable<boolean>;

  @ViewChild('modalReply', {static: true})
  templateModalReply: TemplateRef<unknown>;

  private storage: StorageService;

  private refresh = new Subject();

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
    this.canEdit$ = combineLatest([
      this.user.isOrg$,
      this.backend.user$.pipe(map((user) => user?.id === this.post.author))
    ]).pipe(map(([isOrg, isAuthor]) => isOrg || isAuthor));

    this.canDelete$ = combineLatest(
      [
        this.canEdit$,
        concat(of(true), this.postsModified.asObservable()),
        concat(of(true), this.refresh.asObservable())
      ]
    ).pipe(map(([canEdit]) => canEdit && !this.post.reaction.length));
  }

  setExpanded(value: boolean): void {
    this.expanded = value;
    this.storage.set<boolean>('expanded', value, DiscussionThreadPostsComponent.EXPANDED_DEFAULT);
  }

  openReplyModal(): void {
    this.user.afterLogin$.subscribe(() => {
      const modal = this.modal.showPostReplyModal(this.threadId!, this.post, this.posts);
      modal.afterClose$.subscribe(() => {
        if (modal.component.instance.replied) {
          this.postsModified.next();
          this.router.navigate(['/', this.routes.routes.discussion, `${this.threadId}`], {fragment: `${this.post.id}`}).then();
        }
      });
    });
  }

  openEditModal(): void {
    this.user.afterLogin$.subscribe(() => {
      const modal = this.modal.showPostReplyModal(this.threadId!, this.post, this.posts, this.post.body);
      modal.afterClose$.subscribe(() => {
        if (modal.component.instance.replied) {
          this.postsModified.next();
        }
      });
    });
  }

  propagateModified(): void {
    this.postsModified.next();
  }

  deletePost(): void {
    this.modal.yesNo('discussion-thread.post.delete.confirmation')
      .pipe(
        filter((yes) => !!yes),
        mergeMap(() => this.backend.http.postsDeleteSingle(this.postId))
      )
      .subscribe(() => {
        this.postsModified.next();
        if (this.parent === null) {
          // if this post has no parent, navigate to the up-most thread
          this.router.navigate(
            ['/', this.routes.routes.discussion, `${this.threadId}`],
            {fragment: undefined}
          ).then();
        }
      });
  }
}
