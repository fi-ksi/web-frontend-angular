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
import { filter, take } from "rxjs/operators";
import { environment } from "../../../environments/environment";
import { ModalOptions } from "ngx-bootstrap/modal";
import { ModalPostReplyComponent } from "../../components/shared/modal-post-reply/modal-post-reply.component";
import { Post } from "../../../api";

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

  public showModalComponent<T extends ModalComponent>(componentType: Type<T>, options?: ModalOptions): OpenedModal<T> {
    const component = this.container.createComponent(this.resolver.resolveComponentFactory(componentType));
    const {template, visible$} = this.showModalTemplate(component.instance.templateBody, component.instance.title, options);

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

  public showPostReplyModal(threadId: number, post: Post | null = null, posts: PostsMap | null = null): OpenedModal<ModalPostReplyComponent> {
    const ref = this.showModalComponent(ModalPostReplyComponent, {class: 'modal-full-page modal-post-reply'});
    const { instance } = ref.component;
    instance.threadId = threadId;
    instance.post = post;
    instance.posts = posts;
    ref.component.changeDetectorRef.markForCheck();
    return ref;
  }
}
