import { Component, ChangeDetectionStrategy, Input, OnInit } from '@angular/core';
import { ROUTES } from '../../../../../routes/routes';
import { RoutesService } from '../../../../services';

@Component({
  selector: 'ksi-admin-section-card',
  templateUrl: './admin-section-card.component.html',
  styleUrls: ['./admin-section-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdminSectionCardComponent implements OnInit {
  @Input()
  name: string;

  relativeUrl: string;

  constructor(public routes: RoutesService) {
  }

  ngOnInit(): void {

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    this.relativeUrl = ROUTES.admin[this.toCamelCase(this.name)];
  }

  private toCamelCase(str: string): string {
    return str.replace(/-./g, match => match.charAt(1).toUpperCase());
  }
}
