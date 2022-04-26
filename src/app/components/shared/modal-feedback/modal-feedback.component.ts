import { Component, OnInit, ChangeDetectionStrategy, ViewChild, TemplateRef, OnDestroy } from '@angular/core';
import { ModalComponent } from "../../../models";
import { FormBuilder, Validators } from "@angular/forms";
import { BehaviorSubject, Subscription } from "rxjs";
import { BsModalRef } from "ngx-bootstrap/modal";
import { BackendService } from "../../../services";

@Component({
  selector: 'ksi-modal-feedback',
  templateUrl: './modal-feedback.component.html',
  styleUrls: ['./modal-feedback.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ModalFeedbackComponent implements OnDestroy, OnInit, ModalComponent {
@ViewChild('template', {static: true})
  templateBody: TemplateRef<unknown>;

  title = 'modal.feedback.title';

  form = this.fb.group(({
    email: ['', [Validators.email]],
    content: ['', [Validators.required]],
  }));

  private readonly showSuccessSubject = new BehaviorSubject(false);
  readonly showSuccess$ = this.showSuccessSubject.asObservable();

  modalRef: BsModalRef;

  private subs: Subscription[] = [];

  constructor(private backend: BackendService, private fb: FormBuilder) {
  }

  ngOnInit(): void {
  }

  onModalOpened(modalRef: BsModalRef): void {
    this.modalRef = modalRef;
    this.subs.push(this.backend.user$.subscribe((user) => {
      this.form.controls.email.setValue(user?.email);
    }));
  }

  sendFeedback(): void {
    this.showSuccessSubject.next(false);
    this.form.disable();
    this.backend.http
      .sendEmailWithFeedback({email: this.form.controls.email.value, body: this.form.controls.content.value})
      .subscribe(() => {
        this.showSuccessSubject.next(true);
      });
  }

  ngOnDestroy(): void {
    this.subs.forEach((s) => s.unsubscribe());
  }
}
