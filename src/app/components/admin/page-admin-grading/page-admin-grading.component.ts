import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { AdminBaseComponent } from '../base/admin-base.component';
import { IconService } from 'src/app/services/shared/icon.service';
import { RoutesService } from 'src/app/services/shared/routes.service';
import { ModalService } from 'src/app/services/shared/modal.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'ksi-page-admin-grading',
  templateUrl: './page-admin-grading.component.html',
  styleUrls: ['./page-admin-grading.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class PageAdminGradingComponent extends AdminBaseComponent<void> { // TODO! Change from VOID

  oldFrontendUrl = environment.oldFrontendUrl;


  constructor(
    public icon: IconService,
    public routes: RoutesService,

    protected cdr: ChangeDetectorRef,
    protected modal: ModalService,

  ) {
    super(modal, cdr);
  }

  ngOnInit(): void {
  }

  openExternal(event: MouseEvent): void {
    const anchor = event.target as HTMLAnchorElement;
    window.open(anchor.href, '_blank');
  }


}
