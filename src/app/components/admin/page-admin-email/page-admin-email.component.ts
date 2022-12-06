import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { FormBuilder, Validators } from '@angular/forms';
import { map, mergeMap, take } from 'rxjs/operators';
import { YearsService } from '../../../services';
import { Observable } from 'rxjs';
import { MappedFormControl } from '../../../util';

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

  constructor(
    private translate: TranslateService,
    private fb: FormBuilder,
    public years: YearsService
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
      map((year) => year?.year)
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
}
