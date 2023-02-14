import { Component, OnInit, ChangeDetectionStrategy, TemplateRef, ViewChild, ChangeDetectorRef } from '@angular/core';
import { ModalComponent, PostReplyMode, PostsMap } from "../../../models";
import { BsModalRef } from "ngx-bootstrap/modal";
import { FormBuilder, Validators } from "@angular/forms";
import { BackendService, YearsService } from "../../../services";
import { Post } from "../../../../api/backend";
import { Observable, of } from "rxjs";
import { mergeMap, tap } from "rxjs/operators";

@Component({
  selector: 'ksi-modal-post-reply',
  templateUrl: './modal-post-reply.component.html',
  styleUrls: ['./modal-post-reply.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ModalPostReplyComponent implements OnInit, ModalComponent {
  post: Post | null;
  posts: PostsMap | null;
  threadId: number | null;

  get mode(): PostReplyMode {
    return this._mode;
  }

  set mode(value: PostReplyMode) {
    this._mode = value;
    if (this._mode === 'new-thread') {
      this.form.controls.threadName.setValidators([Validators.maxLength(ModalPostReplyComponent.THREAD_NAME_MAX_LENGTH), Validators.required]);
    } else {
      this.form.controls.threadName.setValidators([]);
    }
    this.cd.markForCheck();
  }
  private _mode: PostReplyMode = 'reply';

  private static readonly THREAD_NAME_MAX_LENGTH = 100;
  public readonly REPLY_MAX_LENGTH = 8000; // used in html template

  form = this.fb.group(({
    threadName: ['', []],
    content: ['', [Validators.maxLength(this.REPLY_MAX_LENGTH), Validators.required]],
  }));

  @ViewChild('template', {static: true})
  templateBody: TemplateRef<unknown>;

  title = '';

  private modal: BsModalRef<unknown>;

  replied = false;

  constructor(private cd: ChangeDetectorRef, private backend: BackendService, private fb: FormBuilder, private year: YearsService) { }

  ngOnInit(): void {
  }

  onModalOpened(modalRef: BsModalRef<unknown>): void {
    this.modal = modalRef;
  }

  saveReply(): void {
    if (!this.form.valid) {
      return;
    }

    this.form.disable();

    const reqThreadNew$ = this.backend.http.threadsCreateNew({
      thread: {
        _public: true,
        title: this.form.controls.threadName.value,
        year: this.year.selected!.id
      }
    });

    const reqPre$: Observable<unknown> = this.threadId === null ? reqThreadNew$.pipe(tap((r) => {
      this.threadId = r.thread.id;
    })) : of(true);

    const reqNew = () => this.backend.http.postsCreateNew({
      post: {
        thread: this.threadId!,
        parent: this.post !== null ? this.post.id : null,
        body: this.form.controls.content.value
      }
    });

    const reqEdit = () => this.backend.http.postsEditSingle({
      post: {
        author: this.post!.author,
        body: this.form.controls.content.value
      },
    }, this.post!.id);

    reqPre$.pipe(mergeMap(() => this._mode !== "edit" ? reqNew() : reqEdit()))
      .subscribe(() => {
        this.replied = true;
        this.modal.hide();
      });
  }
}
