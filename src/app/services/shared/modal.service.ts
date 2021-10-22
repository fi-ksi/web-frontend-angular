import {
  ComponentFactory,
  ComponentFactoryResolver,
  ComponentRef,
  Injectable,
  TemplateRef,
  ViewContainerRef
} from '@angular/core';
import { ModalGenericComponent } from "../../components/root/modal-generic/modal-generic.component";
import { Observable } from "rxjs";
import { ModalTemplatesComponent } from "../../components/shared/modal-templates/modal-templates.component";

@Injectable({
  providedIn: 'root'
})
export class ModalService {
  container: ViewContainerRef;

  private _modalTemplates: ComponentRef<ModalTemplatesComponent>;

  private get modalTemplates(): ComponentRef<ModalTemplatesComponent> {
    if (!this._modalTemplates) {
      this._modalTemplates = this.container.createComponent(
        this.resolver.resolveComponentFactory(ModalTemplatesComponent)
      );
    }
    return this._modalTemplates;
  }

  constructor(private resolver: ComponentFactoryResolver) {
  }

  public showModal(template: TemplateRef<unknown>): Observable<boolean> {
    const factory: ComponentFactory<ModalGenericComponent> =
      this.resolver.resolveComponentFactory(ModalGenericComponent);
    const comp = this.container.createComponent(factory);
    comp.instance.modalTemplate = template;
    comp.instance.title = 'helloooo';
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

  public showLoginModal(): Observable<boolean> {
    return this.showModal(this.modalTemplates.instance.modalLogin);
  }
}
