import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { KsiTitleService } from '../../../services';

@Component({
  selector: 'ksi-page-admin-root',
  templateUrl: './page-admin-root.component.html',
  styleUrls: ['./page-admin-root.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PageAdminRootComponent implements OnInit {

  constructor(private title: KsiTitleService) { }

  ngOnInit(): void {
    this.title.subtitle = 'admin.root.title';
  }

}
