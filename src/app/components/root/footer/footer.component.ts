import { ChangeDetectionStrategy, Component, EventEmitter, Output } from '@angular/core';
import { IconService, ThemeService, VersionService } from "../../../services";

@Component({
  selector: 'ksi-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FooterComponent {
  @Output()
  changelogShow: EventEmitter<void> = new EventEmitter<void>();

  constructor(public version: VersionService, public icon: IconService, public theme: ThemeService) {}

  switchTheme(): void {
    if (this.theme.theme === 'dark') {
      this.theme.setLightTheme();
    } else {
      this.theme.setDarkTheme();
    }
  }
}
