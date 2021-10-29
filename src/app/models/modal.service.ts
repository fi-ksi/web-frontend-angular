import { ComponentRef, TemplateRef } from "@angular/core";
import { Observable } from "rxjs";
import { ModalGenericComponent } from "../components/root/modal-generic/modal-generic.component";
import { BsModalRef } from "ngx-bootstrap/modal";

export interface ModalComponent {
  title: string;
  templateBody: TemplateRef<unknown>;
  onModalOpened: (modalRef: BsModalRef<unknown>) => void;
}

export interface OpenedModal<T extends ModalComponent> {
  component: ComponentRef<T>;
  visible$: Observable<boolean>;
}

export interface OpenedTemplate {
  template: ComponentRef<ModalGenericComponent>;
  visible$: Observable<boolean>;
}
