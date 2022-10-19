import { ChangeDetectionStrategy, Component, EventEmitter, Output } from '@angular/core';
import { VersionService } from '../../../services';
import { ROUTES } from '../../../../routes/routes';

@Component({
  selector: 'ksi-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FooterComponent {
  @Output()
  changelogShow: EventEmitter<void> = new EventEmitter<void>();

  readonly routes = ROUTES;

  constructor(public version: VersionService) {}
}
