import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PageArticleComponent } from "./page-article/page-article.component";
import { PageNewsComponent } from "./page-news/page-news.component";

const routes: Routes = [
  {path: ':id', component: PageArticleComponent},
  {path: '', component: PageNewsComponent, pathMatch: 'full'}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class NewsRoutingModule { }
