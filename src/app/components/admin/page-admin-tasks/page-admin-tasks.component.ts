import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'ksi-page-admin-tasks',
  templateUrl: './page-admin-tasks.component.html',
  styleUrls: ['./page-admin-tasks.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PageAdminTasksComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
