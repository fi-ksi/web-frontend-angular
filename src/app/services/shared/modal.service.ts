import {
  ComponentFactory,
  ComponentFactoryResolver,
  Injectable,
  TemplateRef, Type,
  ViewContainerRef
} from '@angular/core';
import { ModalGenericComponent } from "../../components/shared/modal-generic/modal-generic.component";
import { TranslateService } from "@ngx-translate/core";
import { ModalComponent, OpenedModal, OpenedTemplate, PostsMap } from "../../models";
import { ModalLoginComponent } from "../../components/shared/modal-login/modal-login.component";
import { filter, mapTo, take } from "rxjs/operators";
import { environment } from "../../../environments/environment";
import { ModalOptions } from "ngx-bootstrap/modal";
import { ModalPostReplyComponent } from "../../components/shared/modal-post-reply/modal-post-reply.component";
import { Post } from "../../../api";
import { ModalServerErrorComponent } from "../../components/shared/modal-server-error/modal-server-error.component";
import { ModalRegisterComponent } from "../../components/shared/modal-register/modal-register.component";
import { ModalTermsOfUseComponent } from "../../components/shared/modal-terms-of-use/modal-terms-of-use.component";

@Injectable({
  providedIn: 'root'
})
export class ModalService {
  container: ViewContainerRef;

  constructor(private resolver: ComponentFactoryResolver, private translate: TranslateService) {
  }

  public showModalTemplate(template: TemplateRef<unknown>, title: string, options?: ModalOptions): OpenedTemplate {
    const factory: ComponentFactory<ModalGenericComponent> =
      this.resolver.resolveComponentFactory(ModalGenericComponent);
    const comp = this.container.createComponent(factory);
    comp.instance.modalTemplate = template;
    comp.instance.title = this.translate.instant(title);
    comp.instance.options = options;
    comp.instance.cd.detectChanges();
    comp.instance.show();

    const {visible$} = comp.instance;

    const afterClose$ = visible$.pipe(filter((visible) => !visible), take(1), mapTo(undefined));

    afterClose$.subscribe(() => {
      environment.logger.debug('destroying modal component on hide');
      comp.destroy()
    });

    return {
      template: comp,
      visible$,
      afterClose$
    };
  }

  public showModalComponent<T extends ModalComponent>(componentType: Type<T>, options?: ModalOptions): OpenedModal<T> {
    const component = this.container.createComponent(this.resolver.resolveComponentFactory(componentType));
    const {template, visible$, afterClose$} = this.showModalTemplate(component.instance.templateBody, component.instance.title, options);

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
      visible$,
      afterClose$,
    }
  }

  public showLoginModal(): OpenedModal<ModalLoginComponent> {
    return this.showModalComponent(ModalLoginComponent);
  }

  public showRegisterModal(email = '', password = ''): OpenedModal<ModalRegisterComponent> {
    const ref = this.showModalComponent(ModalRegisterComponent, {
      class: 'modal-full-page',
      ignoreBackdropClick: true,
      backdrop: "static"
    });

    ref.component.instance.form.patchValue({email, password});

    return ref;
  }

  public showTOSModal(): OpenedModal<ModalTermsOfUseComponent> {
    return this.showModalComponent(ModalTermsOfUseComponent, { class: 'modal-full-page' });
  }

  public showPostReplyModal(threadId: number, post: Post | null = null, posts: PostsMap | null = null): OpenedModal<ModalPostReplyComponent> {
    const ref = this.showModalComponent(ModalPostReplyComponent, {class: 'modal-full-page modal-post-reply'});
    const { instance } = ref.component;
    instance.threadId = threadId;
    instance.post = post;
    instance.posts = posts;
    ref.component.changeDetectorRef.markForCheck();
    return ref;
  }

  public showServerErrorModal(): OpenedModal<ModalServerErrorComponent> {
    return this.showModalComponent(ModalServerErrorComponent);
  }
}
