import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'ksi-page-admin-root',
  templateUrl: './page-admin-root.component.html',
  styleUrls: ['./page-admin-root.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PageAdminRootComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
