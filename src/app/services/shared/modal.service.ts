import {
  ComponentFactory,
  ComponentFactoryResolver,
  Injectable,
  TemplateRef, Type,
  ViewContainerRef
} from '@angular/core';
import { ModalGenericComponent } from '../../components/shared/modal-generic/modal-generic.component';
import { TranslateService } from '@ngx-translate/core';
import { ModalComponent, OpenedModal, OpenedTemplate, PostReplyMode, PostsMap } from '../../models';
import { ModalLoginComponent } from '../../components/shared/modal-login/modal-login.component';
import { filter, map, mapTo, take } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { ModalOptions } from 'ngx-bootstrap/modal';
import { ModalPostReplyComponent } from '../../components/shared/modal-post-reply/modal-post-reply.component';
import { Post } from '../../../api';
import { ModalServerErrorComponent } from '../../components/shared/modal-server-error/modal-server-error.component';
import { ModalRegisterComponent } from '../../components/shared/modal-register/modal-register.component';
import { ModalTermsOfUseComponent } from '../../components/shared/modal-terms-of-use/modal-terms-of-use.component';
import { Observable } from 'rxjs';
import { ModalYesNoComponent } from '../../components/shared/modal-yes-no/modal-yes-no.component';
import {
  ModalResetPasswordComponent
} from '../../components/shared/modal-reset-password/modal-reset-password.component';
import { ModalFeedbackComponent } from '../../components/shared/modal-feedback/modal-feedback.component';

@Injectable({
  providedIn: 'root'
})
export class ModalService {
  container: ViewContainerRef;

  private loginModalInstance: OpenedModal<ModalLoginComponent> | null = null;
  private serverErrorModalInstance: OpenedModal<ModalServerErrorComponent> | null = null;

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
      environment.logger.debug('[MODAL] destroying modal component on hide');
      comp.destroy();
    });

    return {
      template: comp,
      visible$,
      afterClose$
    };
  }

  public showModalComponent<T extends ModalComponent>(componentType: Type<T>, options?: ModalOptions, title?: string): OpenedModal<T> {
    const component = this.container.createComponent(this.resolver.resolveComponentFactory(componentType));
    const {template, visible$, afterClose$} = this.showModalTemplate(component.instance.templateBody, title || component.instance.title, options);

    visible$
      .pipe(
        filter((visible) => visible),
        take(1)
      ).subscribe(() => {
        environment.logger.debug('sending modal ref', template.instance.modalRef);
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        component.instance.onModalOpened(template.instance.modalRef!);
      });

    return {
      component,
      visible$,
      afterClose$,
    };
  }

  /**
   * Shows login modal
   * If already shown, returns the visible instance
   */
  public showLoginModal(): OpenedModal<ModalLoginComponent> {
    if (!this.loginModalInstance) {
      this.loginModalInstance = this.showModalComponent(ModalLoginComponent);
      this.loginModalInstance.afterClose$.subscribe(() => this.loginModalInstance = null);
    }

    return this.loginModalInstance;
  }

  /**
   * Hides login modal if was already shown
   * @return true if modal was visible and is now hidden, false otherwise
   */
  public hideLoginModal(): boolean {
    if (!this.loginModalInstance) {
      return false;
    }

    this.loginModalInstance.component.instance.modalRef.hide();
    this.loginModalInstance = null;
    return true;
  }

  public showRegisterModal(email = '', password = ''): OpenedModal<ModalRegisterComponent> {
    const ref = this.showModalComponent(ModalRegisterComponent, {
      class: 'modal-full-page',
      ignoreBackdropClick: true,
      backdrop: 'static'
    });

    ref.component.instance.form.patchValue({email, password});

    return ref;
  }

  public showForgottenPasswordModal(email = ''): OpenedModal<ModalResetPasswordComponent> {
    const ref = this.showModalComponent(ModalResetPasswordComponent);

    ref.component.instance.form.patchValue({email});

    return ref;
  }

  public showTOSModal(): OpenedModal<ModalTermsOfUseComponent> {
    return this.showModalComponent(ModalTermsOfUseComponent, { class: 'modal-full-page' });
  }

  public showFeedbackModal(): OpenedModal<ModalFeedbackComponent> {
    return this.showModalComponent(ModalFeedbackComponent, { class: 'modal-full-page' });
  }

  public yesNo(
    question: string | null = null,
    defaultAnswer: boolean | null = null,
    optionYes: string | null = null,
    optionNo: string | null = null
  ): Observable<boolean | null> {
    const ref = this.showModalComponent(ModalYesNoComponent);
    const {instance} = ref.component;

    if (question) {
      instance.question = question;
    }
    if (optionYes) {
      instance.optionYes = optionYes;
    }
    if (optionNo) {
      instance.optionNo = optionNo;
    }
    instance.cd.markForCheck();

    return ref.afterClose$.pipe(map(() => {
      const {answer} = instance;
      return answer !== null ? answer : defaultAnswer;
    }));
  }

  public showPostReplyModal(threadId: number | null, post: Post | null = null, posts: PostsMap | null = null, text = ''): OpenedModal<ModalPostReplyComponent> {
    const mode: PostReplyMode = threadId === null ? 'new-thread' : text ? 'edit' : 'reply';
    const title = `modal.post-reply.title.${mode}`;

    const ref = this.showModalComponent(ModalPostReplyComponent, {class: 'modal-full-page modal-post-reply'}, title);
    const { instance } = ref.component;
    instance.threadId = threadId;
    instance.post = post;
    instance.posts = posts;
    instance.mode = mode;
    if (text) {
      instance.form.controls.content.setValue(text);
    }
    ref.component.changeDetectorRef.markForCheck();
    return ref;
  }

  public showServerErrorModal(): OpenedModal<ModalServerErrorComponent> {
    if (!this.serverErrorModalInstance) {
      this.serverErrorModalInstance = this.showModalComponent(ModalServerErrorComponent);
      this.serverErrorModalInstance.afterClose$.subscribe(() => this.serverErrorModalInstance = null);
    }

    return this.serverErrorModalInstance;
  }
}
