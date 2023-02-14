import { Component, OnInit, ChangeDetectionStrategy, ViewChild, TemplateRef } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { FormBuilder, Validators } from '@angular/forms';
import { map, mergeMap, shareReplay, take, tap } from 'rxjs/operators';
import { BackendService, ModalService, YearsService } from '../../../services';
import { Observable } from 'rxjs';
import { MappedFormControl, SubscribedComponent } from '../../../util';
import { OpenedTemplate } from '../../../models';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'ksi-page-admin-email',
  templateUrl: './page-admin-email.component.html',
  styleUrls: ['./page-admin-email.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PageAdminEmailComponent extends SubscribedComponent implements OnInit {
  // BCC and year fields need to be separate so that the Angular template recognizes it as MappedFormControl instead of AbstractControl
  bcc = new MappedFormControl<string[], string>((addresses) => addresses.join('\n'), (addressList) => addressList ? addressList.split('\n') : []);
  to = new MappedFormControl<number, string>((n) => `${n}`, (n) => Number(n));

  emailForm = this.fb.group({
    to: this.to,
    subject: ['', Validators.required],
    body: ['', Validators.required],
    successful: [false, Validators.required],
    type: [null, Validators.required],
    sex: ['both', Validators.required],
    school: ['both', Validators.required],
    advancedUsed: [false, Validators.required],
    bcc: this.bcc,
    replyTo: ['', Validators.email]
  });

  selectedYearName$: Observable<string | undefined>;

  @ViewChild('modalMailCheck', {static: true})
  modalCheckTemplate: TemplateRef<unknown>;
  modalCheck?: OpenedTemplate;

  constructor(
    private translate: TranslateService,
    private fb: FormBuilder,
    public years: YearsService,
    private modal: ModalService,
    private backend: BackendService,
  ) {
    super();
  }

  ngOnInit(): void {
    this.translate.get('admin.email.subject.initial').pipe(take(1))
      .subscribe((text) => {
        if (!this.emailForm.controls.subject.value) {
          this.emailForm.controls.subject.setValue(text);
          this.emailForm.controls.subject.addValidators((x) => x.value === text ? {error: 'Cannot leave the default value'} : null);
          this.emailForm.controls.subject.updateValueAndValidity();
        }
      });

    // select current year as default TO field
    this.selectedYearName$ = this.to.valueOuterChanges.pipe(
      mergeMap((yearId) => this.years.getById(yearId)),
      tap((x) => environment.logger.debug('[MAIL] year selected', x)),
      map((year) => year?.year),
      shareReplay(1)
    );
    this.subscribe(this.selectedYearName$);
    setTimeout(
      () => this.years.selected$.pipe(take(1)).subscribe((v) => {
        if (v === null) {
          return;
        }
        environment.logger.debug('[MAIL] year selection received', v);
        this.to.setOuterValue(v.id);
      }),
    );
    this.resetAdvancedSettings();
  }

  advancedSettingsOpened(opened: boolean): void {
    this.emailForm.controls.advancedUsed.setValue(opened);
    if (!opened) {
      this.resetAdvancedSettings();
    }
  }

  resetAdvancedSettings(): void {
    this.translate.get('admin.email.reply-to.initial').pipe(take(1))
      .subscribe((text) => this.emailForm.controls.replyTo.setValue(text));
    this.bcc.setValue('');
  }

  openCheckModal(): void {
    if (!this.emailForm.valid || this.emailForm.disabled || this.modalCheck) {
      return;
    }

    this.emailForm.disable();
    this.modalCheck = this.modal.showModalTemplate(this.modalCheckTemplate, 'admin.email.check.title', {
      class: 'modal-full-page'
    });
    this.modalCheck.afterClose$.subscribe(() => {
      this.emailForm.enable();
      this.modalCheck = undefined;
    });
  }

  sendEmail(): void {
    environment.logger.debug('[MAIL] sending', this.emailForm.value);

    this.backend.http.adminEmailSend({'e-mail': {
      Subject: this.emailForm.controls.subject.value,
      Body: this.emailForm.controls.body.value,
      Reply_To: this.emailForm.controls.advancedUsed.value ? this.emailForm.controls.replyTo.value : undefined,
      To: [this.to.valueOuter],
      Bcc: this.bcc.valueOuter,
      Gender: this.emailForm.controls.sex.value,
      KarlikSign: true,
      EasterEgg: false,
      Category: this.emailForm.controls.school.value,
      Type: this.emailForm.controls.type.value,
      Successful: this.emailForm.controls.successful.value,
    }}).subscribe((response) => {
      // TODO: show success toast
      this.modalCheck?.template.instance.close();
    });
  }
}
