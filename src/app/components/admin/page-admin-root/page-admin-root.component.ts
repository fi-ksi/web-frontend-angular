import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { IconService, KsiTitleService, UserService } from '../../../services';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'ksi-page-admin-root',
  templateUrl: './page-admin-root.component.html',
  styleUrls: ['./page-admin-root.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PageAdminRootComponent implements OnInit {

  oldFrontendUrl = environment.oldFrontendUrl;

  constructor(private title: KsiTitleService, public userService: UserService,
    public icon: IconService) {

     }

  ngOnInit(): void {
    this.title.subtitle = 'admin.root.title';
  }

  openExternal(event: MouseEvent): void {
    const anchor = event.target as HTMLAnchorElement;
    window.open(anchor.href, '_blank');
  }

}
