import { ComponentRef, TemplateRef } from "@angular/core";
import { Observable } from "rxjs";
import { ModalGenericComponent } from "../components/shared/modal-generic/modal-generic.component";
import { BsModalRef } from "ngx-bootstrap/modal";

export interface ModalComponent {
  title: string;
  templateBody: TemplateRef<unknown>;
  onModalOpened: (modalRef: BsModalRef<unknown>) => void;
}

interface OpenedModalBase {
  visible$: Observable<boolean>;
  afterClose$: Observable<void>;
}

export interface OpenedModal<T extends ModalComponent> extends OpenedModalBase {
  component: ComponentRef<T>;
}

export interface OpenedTemplate extends OpenedModalBase {
  template: ComponentRef<ModalGenericComponent>;
}
