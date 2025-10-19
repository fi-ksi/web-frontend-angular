import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { IYear } from 'src/app/models';
import { IconService, ModalService, RoutesService, YearsService } from 'src/app/services';
import { AdminYearsService } from 'src/app/services/admin/admin-years.service';
import { AdminBaseComponent } from '../base/admin-base.component';

@Component({
  selector: 'ksi-page-admin-years',
  templateUrl: './page-admin-years.component.html',
  styleUrls: ['./page-admin-years.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class PageAdminYearsComponent extends AdminBaseComponent<IYear> implements OnInit {
  loadItemsFunction = () => this.adminYears.getYears();
  deleteFunction = (itemId: number) => this.adminYears.deleteYear(itemId);

  constructor(
    public icon: IconService,
    public routes: RoutesService,
    public adminYears: AdminYearsService,
    public modal: ModalService,
    public cdr: ChangeDetectorRef,
  ) {
    super(modal, cdr);
  }

  ngOnInit(): void {
    super.ngOnInit();
  }
}
