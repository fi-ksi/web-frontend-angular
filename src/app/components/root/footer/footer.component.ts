import { ChangeDetectionStrategy, Component } from '@angular/core';
import { VersionService } from "../../../services";

@Component({
  selector: 'ksi-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FooterComponent {
  constructor(public version: VersionService) {}
}
