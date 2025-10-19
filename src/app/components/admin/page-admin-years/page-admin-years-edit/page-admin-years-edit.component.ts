import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { User, Year } from 'src/api/backend';
import { IconService, ModalService, RoutesService } from 'src/app/services';
import { AdminYearsService } from 'src/app/services/admin/admin-years.service';
import { AdminBaseEditComponent } from '../../base/admin-edit-base.component';

@Component({
  selector: 'ksi-page-admin-years-edit',
  templateUrl: './page-admin-years-edit.component.html',
  styleUrls: ['./page-admin-years-edit.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class PageAdminYearsEditComponent extends AdminBaseEditComponent<Year> implements OnInit {
  form = this.fb.group({
    index: [0, [Validators.required]],
    year: ["", [Validators.required]],
    sealed: [false],
    point_pad: [null, [Validators.required]],
    active_orgs: [[]]
  });

  createFunction = () => this.adminYears.createYear({ year: this.form.value });
  updateFunction = () => this.adminYears.updateYear({ year: this.form.value }, this.itemId);
  loadItemFunction = (itemId: number) => this.adminYears.getYearById(itemId).pipe(map(response => response!));

  adminUsers$: Observable<User[]>;

  constructor(
    public icon: IconService,
    public routes: RoutesService,
    public adminYears: AdminYearsService,
    public fb: FormBuilder,
    public router: Router,
    public modal: ModalService,
    public cdr: ChangeDetectorRef,
  ) {
    super(router, routes, modal, cdr);
  }

  ngOnInit(): void {
    this.adminYears.createYear
    super.ngOnInit();

    this.adminUsers$ = this.adminYears.getAllOrganisators();

    let x = this.adminUsers$.pipe(tap(users => {
        const activeUsers = users.filter(user => user.seasons?.includes(this.itemId)).map(user => '' + user.id);
        this.form.patchValue({ active_orgs: activeUsers });
      })
    ).subscribe();

    this.subscriptions.push(x);
  }

  isUserActive(userId: number): boolean {
    return this.form.value.active_orgs.includes('' + userId);
  }

  toggleUserActive(userId: number) {
    const activeOrgs = this.form.value.active_orgs;
    if (this.isUserActive(userId)) {
      this.form.patchValue({ active_orgs: activeOrgs.filter((id: string) => id !== '' + userId) });
    } else {
      this.form.patchValue({ active_orgs: [...activeOrgs, '' + userId] });
    }
    this.cdr.markForCheck();
  }
}
