import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { Router } from '@angular/router';
import { ROUTES } from '../../../../../routes/routes';

@Component({
  selector: 'ksi-admin-section-card',
  templateUrl: './admin-section-card.component.html',
  styleUrls: ['./admin-section-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdminSectionCardComponent {
  @Input()
  name: string;

  constructor(private router: Router) {
  }

  navigate(): void {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const relativeAdminURL = ROUTES.admin[this.name];
    this.router.navigate(['/', ROUTES.admin._, relativeAdminURL]).then();
  }
}
