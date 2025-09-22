import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { Observable } from 'rxjs';
import { IYear } from 'src/app/models';
import { IconService, RoutesService, YearsService } from 'src/app/services';
import { AdminWavesService } from 'src/app/services/admin/admin-waves.service';
import { AdminYearsService } from 'src/app/services/admin/admin-years.service';

@Component({
  selector: 'ksi-page-admin-years',
  templateUrl: './page-admin-years.component.html',
  styleUrls: ['./page-admin-years.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PageAdminYearsComponent implements OnInit {

  constructor(
    public icon: IconService,
    public routes: RoutesService,
    public adminYears: AdminYearsService,
    private cdr: ChangeDetectorRef,
  ) { }

  years$: Observable<IYear[]>;

  ngOnInit(): void {
    this.reloadYears();
  }

  reloadYears() {
    this.years$ = this.adminYears.getYears();
    this.cdr.markForCheck();
  }

  deleteYear(yearId: number): void {
    if (confirm(`Are you sure you want to delete this year?`)) {
      this.adminYears.deleteYear(yearId).subscribe({
        next: () => {
          this.reloadYears();
        },
        error: (err) => {
          alert(`Error deleting year: ${err?.message || err}`);
        }
      });
    }
  }

}
