import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { FormBuilder, Validators } from '@angular/forms';
import { map, mergeMap, take, tap } from 'rxjs/operators';
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
  emailForm = this.fb.group({
    to: new MappedFormControl<number, string>((n) => `${n}`, (n) => Number(n)),
    subject: ['', Validators.required],
    body: ['', Validators.required],
    successful: [false, Validators.required],
    type: [null, Validators.required],
    sex: ['both', Validators.required],
    school: ['both', Validators.required]
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

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const yearControl: MappedFormControl<number, string> = this.emailForm.controls.to;

    this.selectedYearName$ = yearControl.valueOuterChanges.pipe(
      tap((x) => console.log('yearId', x, typeof x)),
      mergeMap((yearId) => this.years.getById(yearId)),
      tap((x) => console.log('year', x)),
      map((year) => year?.year)
    );
    this.years.selected$.pipe(take(1)).subscribe((v) => this.emailForm.controls.to.setValue(v?.id));
  }
}
