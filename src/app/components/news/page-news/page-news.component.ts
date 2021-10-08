import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { YearsService } from "../../../services";

@Component({
  selector: 'ksi-page-news',
  templateUrl: './page-news.component.html',
  styleUrls: ['./page-news.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PageNewsComponent implements OnInit {

  constructor(public years: YearsService) { }

  ngOnInit(): void {
  }

}
