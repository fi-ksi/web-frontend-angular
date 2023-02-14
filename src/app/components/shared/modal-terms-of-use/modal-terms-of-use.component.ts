import { Component, OnInit, ChangeDetectionStrategy, TemplateRef, ViewChild } from '@angular/core';
import { ModalComponent } from '../../../models';
import { BsModalRef } from 'ngx-bootstrap/modal';

@Component({
  selector: 'ksi-modal-terms-of-use',
  templateUrl: './modal-terms-of-use.component.html',
  styleUrls: ['./modal-terms-of-use.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ModalTermsOfUseComponent implements OnInit, ModalComponent {
  @ViewChild('template', { static: true })
  templateBody: TemplateRef<unknown>;
  title = 'modal.tos.title';

  private modalRef: BsModalRef<unknown>;

  constructor() { }

  ngOnInit(): void {
  }

  onModalOpened(ref: BsModalRef<unknown>): void {
    this.modalRef = ref;
  }

  closeModal(): void {
    this.modalRef.hide();
  }
}
