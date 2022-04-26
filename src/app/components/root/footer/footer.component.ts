import { ChangeDetectionStrategy, Component, EventEmitter, Output } from '@angular/core';
import { VersionService } from "../../../services";

@Component({
  selector: 'ksi-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FooterComponent {
  @Output()
  changelogShow: EventEmitter<void> = new EventEmitter<void>();

  constructor(public version: VersionService) {}
}
