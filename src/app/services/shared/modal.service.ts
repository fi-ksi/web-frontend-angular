import {
  ComponentFactory,
  ComponentFactoryResolver,
  Injectable,
  TemplateRef, Type,
  ViewContainerRef
} from '@angular/core';
import { ModalGenericComponent } from "../../components/root/modal-generic/modal-generic.component";
import { TranslateService } from "@ngx-translate/core";
import { ModalComponent, OpenedModal, OpenedTemplate } from "../../models";
import { ModalLoginComponent } from "../../components/root/modal-login/modal-login.component";
import { filter, take } from "rxjs/operators";
import { environment } from "../../../environments/environment";

@Injectable({
  providedIn: 'root'
})
export class ModalService {
  container: ViewContainerRef;

  constructor(private resolver: ComponentFactoryResolver, private translate: TranslateService) {
  }

  public showModalTemplate(template: TemplateRef<unknown>, title: string): OpenedTemplate {
    const factory: ComponentFactory<ModalGenericComponent> =
      this.resolver.resolveComponentFactory(ModalGenericComponent);
    const comp = this.container.createComponent(factory);
    comp.instance.modalTemplate = template;
    comp.instance.title = this.translate.instant(title);
    comp.instance.cd.detectChanges();
    comp.instance.show();

    const {visible$} = comp.instance;

    visible$
      .pipe(filter((visible) => !visible), take(1))
      .subscribe(() => {
        environment.logger.debug('destroying modal component on hide');
        comp.destroy()
      });

    return {
      template: comp,
      visible$
    };
  }

  public showModalComponent<T extends ModalComponent>(componentType: Type<T>): OpenedModal<T> {
    const component = this.container.createComponent(this.resolver.resolveComponentFactory(componentType));
    const {template, visible$} = this.showModalTemplate(component.instance.templateBody, component.instance.title);

    visible$
      .pipe(
        filter((visible) => visible),
        take(1)
      ).subscribe(() => {
        environment.logger.debug('sending modal ref', template.instance.modalRef);
        component.instance.onModalOpened(template.instance.modalRef!)
    });

    return {
      component,
      visible$
    }
  }

  public showLoginModal(): OpenedModal<ModalLoginComponent> {
    return this.showModalComponent(ModalLoginComponent);
  }
}
