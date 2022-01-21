import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { KsiTitleService, UserService, YearsService } from "../../../services";
@Component({
  selector: 'ksi-page-discussions',
  templateUrl: './page-discussions.component.html',
  styleUrls: ['./page-discussions.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PageDiscussionsComponent implements OnInit {
  constructor(public years: YearsService, private title: KsiTitleService, public user: UserService) { }

  ngOnInit(): void {
    this.title.subtitle = 'discussion.title';
  }

}
