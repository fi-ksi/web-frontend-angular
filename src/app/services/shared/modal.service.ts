import {
  ComponentFactory,
  ComponentFactoryResolver,
  Injectable,
  TemplateRef, Type,
  ViewContainerRef
} from '@angular/core';
import { ModalGenericComponent } from "../../components/root/modal-generic/modal-generic.component";
import { Observable } from "rxjs";
import { TranslateService } from "@ngx-translate/core";
import { ModalComponent, OpenedModal } from "../../models";
import { ModalLoginComponent } from "../../components/root/modal-login/modal-login.component";

@Injectable({
  providedIn: 'root'
})
export class ModalService {
  container: ViewContainerRef;

  constructor(private resolver: ComponentFactoryResolver, private translate: TranslateService) {
  }

  public showModalTemplate(template: TemplateRef<unknown>, title: string): Observable<boolean> {
    const factory: ComponentFactory<ModalGenericComponent> =
      this.resolver.resolveComponentFactory(ModalGenericComponent);
    const comp = this.container.createComponent(factory);
    comp.instance.modalTemplate = template;
    comp.instance.title = this.translate.instant(title);
    comp.instance.cd.detectChanges();
    comp.instance.show();
    const sub = comp.instance.visible$.subscribe((visible) => {
      if (!visible) {
        comp.destroy();
        sub.unsubscribe();
      }
    });
    return comp.instance.visible$;
  }

  public showModalComponent<T extends ModalComponent>(componentType: Type<T>): OpenedModal<T>{
    const component = this.container.createComponent(this.resolver.resolveComponentFactory(componentType));
    const visible$ = this.showModalTemplate(component.instance.templateBody, component.instance.title);

    return {
      component,
      visible$
    }
  }

  public showLoginModal(): OpenedModal<ModalLoginComponent> {
    return this.showModalComponent(ModalLoginComponent);
  }
}
