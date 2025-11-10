import { Injectable } from '@angular/core';
import { BackendService, YearsService } from '../shared';
import { Observable } from 'rxjs';
import { Article, ArticleCreationRequest } from 'src/api/backend';
import { map, switchMap, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AdminArticlesService {

  constructor(
    private backend: BackendService,
    private yearsService: YearsService
  ) { }

  public getArticles(): Observable<Article[]> {
    return this.yearsService.selected$.pipe(
      switchMap(year => this.backend.http.articlesGetAll(undefined, undefined, undefined, year?.id).pipe(
        map(response => response.articles || [])
      ))
    );
  }

  public getArticleById(articleId: number): Observable<Article | undefined> {
    return this.backend.http.articlesGetSingle(articleId).pipe(
      map(response => response.article)
    );
  }

  public createArticle(article: ArticleCreationRequest): Observable<ArticleCreationRequest> {
    return this.backend.http.articlesCreateNew(article);
  }

  public updateArticle(articleId: number, article: ArticleCreationRequest): Observable<Article> {
    return this.backend.http.articlesEditSingle(article, articleId).pipe(
      map(response => response.article)
    );
  }

  public deleteArticle(articleId: number): Observable<void> {
    return this.backend.http.articlesDeleteSingle(articleId).pipe(
      map(() => undefined)
    );
  }
}
