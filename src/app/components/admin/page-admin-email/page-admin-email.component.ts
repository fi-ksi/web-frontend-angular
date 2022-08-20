import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { FormBuilder } from '@angular/forms';
import { take } from 'rxjs/operators';

@Component({
  selector: 'ksi-page-admin-email',
  templateUrl: './page-admin-email.component.html',
  styleUrls: ['./page-admin-email.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PageAdminEmailComponent implements OnInit {
  emailForm = this.fb.group({
    subject: [''],
    body: ['']
  });

  constructor(private translate: TranslateService, private fb: FormBuilder) { }

  ngOnInit(): void {
    this.translate.get('admin.email.subject.initial').pipe(take(1))
      .subscribe((text) => {
        if (!this.emailForm.controls.subject.value) {
          this.emailForm.controls.subject.setValue(text);
        }
      });
  }

}
