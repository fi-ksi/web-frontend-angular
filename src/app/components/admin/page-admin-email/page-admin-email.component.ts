import { Component, OnInit, ChangeDetectionStrategy, ViewChild, TemplateRef } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { FormBuilder, Validators } from '@angular/forms';
import { map, mergeMap, shareReplay, take } from 'rxjs/operators';
import { BackendService, ModalService, YearsService } from '../../../services';
import { Observable } from 'rxjs';
import { MappedFormControl } from '../../../util';
import { OpenedTemplate } from '../../../models';

@Component({
  selector: 'ksi-page-admin-email',
  templateUrl: './page-admin-email.component.html',
  styleUrls: ['./page-admin-email.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PageAdminEmailComponent implements OnInit {
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
    private backend: BackendService
  ) { }

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
      map((year) => year?.year),
      shareReplay(1)
    );
    setTimeout(
      () => this.years.selected$.pipe(take(1)).subscribe((v) => this.emailForm.controls.to.setValue(v?.id))
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
    this.modalCheck = this.modal.showModalTemplate(this.modalCheckTemplate, 'admin.email.check.title');
    this.modalCheck.afterClose$.subscribe(() => this.modalCheck = undefined);
  }

  sendEmail(): void {
    if (this.emailForm.valid) {
      return;
    }

    // this.backend.http.adminEmailSend({e_mail: {
    //     Subject: this.emailForm.controls.subject.value,
    //     Body: this.emailForm.controls.body.value,
    //     Reply_To: this.emailForm.controls.advancedUsed.value ? this.emailForm.controls.replyTo.value : undefined,
    //
    //   }});
  }
}
