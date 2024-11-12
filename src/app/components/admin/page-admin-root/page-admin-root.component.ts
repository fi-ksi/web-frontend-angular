import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import {KsiTitleService, UserService} from '../../../services';

@Component({
  selector: 'ksi-page-admin-root',
  templateUrl: './page-admin-root.component.html',
  styleUrls: ['./page-admin-root.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PageAdminRootComponent implements OnInit {

  constructor(private title: KsiTitleService, public userService: UserService) { }

  ngOnInit(): void {
    this.title.subtitle = 'admin.root.title';
  }

}
