import { ComponentRef, TemplateRef } from '@angular/core';
import { Observable } from 'rxjs';
import { ModalGenericComponent } from '../components/shared/modal-generic/modal-generic.component';
import { BsModalRef } from 'ngx-bootstrap/modal';

export interface ModalComponent {
  title: string;
  templateBody: TemplateRef<unknown>;
  onModalOpened: (modalRef: BsModalRef<unknown>) => void;
}

interface OpenedModalBase {
  /**
   * An observable that fires every time the modal is shown or hidden
   */
  visible$: Observable<boolean>;
  /**
   * An observable that fires only once at the time that the modal is closed
   */
  afterClose$: Observable<void>;
}

export interface OpenedModal<T extends ModalComponent> extends OpenedModalBase {
  component: ComponentRef<T>;
}

export interface OpenedTemplate extends OpenedModalBase {
  template: ComponentRef<ModalGenericComponent>;
}
