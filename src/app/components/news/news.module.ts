import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { NewsRoutingModule } from './news-routing.module';
import { PageNewsComponent } from './page-news/page-news.component';
import { PageArticleComponent } from './page-article/page-article.component';
import { SharedModule } from "../shared/shared.module";


@NgModule({
  declarations: [
    PageNewsComponent,
    PageArticleComponent
  ],
  imports: [
    CommonModule,
    NewsRoutingModule,
    SharedModule,
  ]
})
export class NewsModule { }
