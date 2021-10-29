import { ComponentRef, TemplateRef } from "@angular/core";
import { Observable } from "rxjs";

export interface ModalComponent {
  title: string;
  templateBody: TemplateRef<unknown>;
}

export interface OpenedModal<T extends ModalComponent> {
  component: ComponentRef<T>;
  visible$: Observable<boolean>;
}
