import { Component, OnInit, ChangeDetectionStrategy, Input, HostBinding, HostListener } from '@angular/core';
import { Article } from "../../../../api/backend";
import { TranslateService } from "@ngx-translate/core";
import { Router } from "@angular/router";
import { ROUTES } from "../../../../routes/routes";

@Component({
  selector: 'ksi-article-preview',
  templateUrl: './article-preview.component.html',
  styleUrls: ['./article-preview.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ArticlePreviewComponent implements OnInit {
  @Input()
  article: Article;

  @Input()
  @HostBinding('class.clickable')
  /**
   * If set to true then whole preview can be clicked to route to the article
   */
  clickable = false;

  @HostListener('click')
  onClick(): void {
    if (!this.clickable) {
      return;
    }
    this.router.navigate([ROUTES.news, this.article.id]).then();
  }

  link: string;

  constructor(public translate: TranslateService, private router: Router) { }

  ngOnInit(): void {
    this.link = `/${ROUTES.news}/${this.article.id}`
  }
}
