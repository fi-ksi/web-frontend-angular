import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { FormBuilder, Validators } from '@angular/forms';
import { take } from 'rxjs/operators';
import { YearsService } from '../../../services';

@Component({
  selector: 'ksi-page-admin-email',
  templateUrl: './page-admin-email.component.html',
  styleUrls: ['./page-admin-email.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PageAdminEmailComponent implements OnInit {
  emailForm = this.fb.group({
    to: [0, Validators.required],
    subject: ['', Validators.required],
    body: ['', Validators.required],
    successful: [false, Validators.required],
    type: [null, Validators.required],
    sex: ['both', Validators.required],
  });

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

    this.years.selected$.pipe(take(1)).subscribe((v) => this.emailForm.controls.to.setValue(v?.id));
  }
}
