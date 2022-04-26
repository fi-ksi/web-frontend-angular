import { Component, OnInit, ChangeDetectionStrategy, ViewChild, TemplateRef } from '@angular/core';
import { FormBuilder, Validators } from "@angular/forms";
import { BehaviorSubject } from "rxjs";
import { BsModalRef } from "ngx-bootstrap/modal";
import { BackendService } from "../../../services";
import { ModalComponent } from "../../../models";

@Component({
  selector: 'ksi-modal-reset-password',
  templateUrl: './modal-reset-password.component.html',
  styleUrls: ['./modal-reset-password.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ModalResetPasswordComponent implements OnInit, ModalComponent {
  @ViewChild('template', {static: true})
  templateBody: TemplateRef<unknown>;

  title = 'modal.reset-password.title';

  form = this.fb.group(({
    email: ['', [Validators.required, Validators.email]],
  }));

  private readonly showSuccessSubject = new BehaviorSubject(false);
  readonly showSuccess$ = this.showSuccessSubject.asObservable();

  modalRef: BsModalRef;

  constructor(private backend: BackendService, private fb: FormBuilder) {
  }

  ngOnInit(): void {
  }

  onModalOpened(modalRef: BsModalRef): void {
    this.modalRef = modalRef;
  }

  resetPassword(): void {
    this.showSuccessSubject.next(false);
    this.form.disable();
    this.backend.http.forgottenPasswordReset({email: this.form.controls.email.value}).subscribe(() => {
      this.showSuccessSubject.next(true);
    });
  }
}
