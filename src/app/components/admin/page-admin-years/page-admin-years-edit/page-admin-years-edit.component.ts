import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Observable, Subscription } from 'rxjs';
import { tap } from 'rxjs/operators';
import { User } from 'src/api/backend';
import { EditMode } from 'src/app/models/EditMode';
import { IconService, RoutesService } from 'src/app/services';
import { AdminYearsService } from 'src/app/services/admin/admin-years.service';

@Component({
  selector: 'ksi-page-admin-years-edit',
  templateUrl: './page-admin-years-edit.component.html',
  styleUrls: ['./page-admin-years-edit.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PageAdminYearsEditComponent implements OnInit {

  editMode: EditMode;
  EditMode = {
    New: 'New',
    Edit: 'Edit'
  };

  yearId: number;

  form = this.fb.group({
    index: [0, [Validators.required]],
    year: ["", [Validators.required]],
    sealed: [false],
    point_pad: [null, [Validators.required]],
    active_orgs: [[]]
  });

  adminUsers$: Observable<User[]>;
  subscriptions: Subscription[] = [];

  constructor(
    public icon: IconService,
    public routes: RoutesService,
    public adminYears: AdminYearsService,
    private fb: FormBuilder,
    private router: Router,
    private cdr: ChangeDetectorRef,
  ) { }


  ngOnInit(): void {
    this.yearId = Number.parseInt(this.router.url.split('/').pop() || '0', 10);
    this.editMode = this.yearId == 0 ? EditMode.New : EditMode.Update;

    if (this.editMode === EditMode.Update) {
      this.adminYears.getYearById(this.yearId).subscribe({
        next: (year) => {
          if (year) {
            this.form.patchValue(year);
          } else {
            alert('Year not found');
            this.router.navigate([this.routes.routes.admin.years]);
          }
        },
        error: (err) => {
          alert(`Error loading year: ${err?.message || err}`);
          this.router.navigate([this.routes.routes.admin.years]);
        }
      });
    }

    this.adminUsers$ = this.adminYears.getAllOrganisators();

    let x = this.adminUsers$.pipe(
      tap(users => {
        const activeUsers = users.filter(user => user.seasons?.includes(this.yearId)).map(user => '' + user.id);
        this.form.patchValue({ active_orgs: activeUsers });
      })
    ).subscribe();

    this.subscriptions.push(x);
  }

  save() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const saveOperation = this.editMode === EditMode.New
      ? this.adminYears.createYear({ year: this.form.value })
      : this.adminYears.updateYear({ year: this.form.value }, this.yearId);

    console.log('Saving year:', this.form.value);
    let x = saveOperation.subscribe({
      next: () => {
        this.router.navigate(['/', this.routes.routes.admin._, this.routes.routes.admin.years._]);
      },
      error: (err) => {
        alert(`Error: ${err?.message || err}`);
      }
    });

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

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

}
