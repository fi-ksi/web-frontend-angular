import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { KsiTitleService, YearsService } from "../../../services";

@Component({
  selector: 'ksi-page-news',
  templateUrl: './page-news.component.html',
  styleUrls: ['./page-news.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PageNewsComponent implements OnInit {

  constructor(public years: YearsService, private title: KsiTitleService) { }

  ngOnInit(): void {
    this.title.subtitle = 'news.title';
  }

}
