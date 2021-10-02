import { Component, OnInit, ChangeDetectionStrategy, Input } from '@angular/core';
import { Article } from "../../../../api";
import { TranslateService } from "@ngx-translate/core";

@Component({
  selector: 'ksi-article-preview',
  templateUrl: './article-preview.component.html',
  styleUrls: ['./article-preview.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ArticlePreviewComponent implements OnInit {
  @Input()
  article: Article;

  link: string;

  constructor(public translate: TranslateService) { }

  ngOnInit(): void {
    this.link = `/news/${this.article.id}`
  }
}
