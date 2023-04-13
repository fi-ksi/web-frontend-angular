import { Component, OnInit, ChangeDetectionStrategy, TemplateRef, ViewChild } from '@angular/core';
import { ModalComponent } from '../../../models';
import { BsModalRef } from 'ngx-bootstrap/modal';

@Component({
  selector: 'ksi-modal-server-error',
  templateUrl: './modal-server-error.component.html',
  styleUrls: ['./modal-server-error.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ModalServerErrorComponent implements OnInit, ModalComponent {
  @ViewChild('template', {static: true})
  templateBody: TemplateRef<unknown>;

  title = 'modal.server-error.title';

  constructor() { }

  ngOnInit(): void {
  }

  onModalOpened(_: BsModalRef<unknown>): void {
  }

}
