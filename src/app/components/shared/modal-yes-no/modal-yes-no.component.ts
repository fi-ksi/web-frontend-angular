import { Component, OnInit, ChangeDetectionStrategy, ViewChild, TemplateRef, ChangeDetectorRef } from '@angular/core';
import { ModalComponent } from '../../../models';
import { BsModalRef } from 'ngx-bootstrap/modal';

@Component({
  selector: 'ksi-modal-yes-no',
  templateUrl: './modal-yes-no.component.html',
  styleUrls: ['./modal-yes-no.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ModalYesNoComponent implements OnInit, ModalComponent {
  @ViewChild('template', {static: true})
  templateBody: TemplateRef<unknown>;

  title = 'modal.yes-no.title';

  question: string;
  optionYes = 'modal.yes-no.yes';
  optionNo = 'modal.yes-no.no';

  modalRef: BsModalRef;

  answer: boolean | null = null;

  constructor(public cd: ChangeDetectorRef) { }

  ngOnInit(): void {
  }

  onModalOpened(modalRef: BsModalRef): void {
    this.modalRef = modalRef;
  }

  saveAnswer(value: boolean) {
    this.answer = value;
    this.modalRef.hide();
  }
}
