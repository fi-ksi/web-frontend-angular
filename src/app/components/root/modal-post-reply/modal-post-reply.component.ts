import { Component, OnInit, ChangeDetectionStrategy, TemplateRef, ViewChild, ChangeDetectorRef } from '@angular/core';
import { ModalComponent, PostsMap } from "../../../models";
import { BsModalRef } from "ngx-bootstrap/modal";
import { FormControl, Validators } from "@angular/forms";
import { BackendService } from "../../../services";
import { Post } from "../../../../api";

@Component({
  selector: 'ksi-modal-post-reply',
  templateUrl: './modal-post-reply.component.html',
  styleUrls: ['./modal-post-reply.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ModalPostReplyComponent implements OnInit, ModalComponent {
  post: Post | null;
  posts: PostsMap | null;
  threadId: number;

  @ViewChild('template', {static: true})
  templateBody: TemplateRef<unknown>;

  title = 'modal.post-reply.title';

  reply = new FormControl(null, [Validators.required]);

  private modal: BsModalRef<unknown>;

  constructor(private cd: ChangeDetectorRef, private backend: BackendService) { }

  ngOnInit(): void {
  }

  onModalOpened(modalRef: BsModalRef<unknown>): void {
    this.modal = modalRef;
  }

  saveReply(): void {
    if (!this.reply.valid) {
      return;
    }
    this.reply.disable();

    this.backend.http.postsCreateNew({
      post: {
        thread: this.threadId!,
        parent: this.post !== null ? this.post.id : null,
        body: this.reply.value
      }
    }).subscribe(() => {
      this.modal.hide();
    });
  }
}
