import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { YearsService } from "../../../services";
@Component({
  selector: 'ksi-page-discussions',
  templateUrl: './page-discussions.component.html',
  styleUrls: ['./page-discussions.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PageDiscussionsComponent implements OnInit {
  constructor(public years: YearsService) { }

  ngOnInit(): void {
  }

}
