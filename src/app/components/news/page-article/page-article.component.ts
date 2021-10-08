import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'ksi-page-article',
  templateUrl: './page-article.component.html',
  styleUrls: ['./page-article.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PageArticleComponent implements OnInit {


  constructor() { }

  ngOnInit(): void {
  }

}
