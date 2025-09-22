import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { Observable } from 'rxjs';
import { Article } from 'src/api/backend';
import { IconService, RoutesService, YearsService } from 'src/app/services';
import { AdminArticlesService } from 'src/app/services/admin/admin-articles.service';
import { AdminWavesService } from 'src/app/services/admin/admin-waves.service';

@Component({
  selector: 'ksi-page-admin-articles',
  templateUrl: './page-admin-articles.component.html',
  styleUrls: ['./page-admin-articles.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PageAdminArticlesComponent implements OnInit {

  constructor(
    public icon: IconService,
    public routes: RoutesService,
    public years: YearsService,
    private cdr: ChangeDetectorRef,
    private adminArticlesService: AdminArticlesService
  ) { }

  articles$: Observable<Article[]>;


  ngOnInit(): void {
    this.reloadArticles();
  }

  reloadArticles() {
    this.articles$ = this.adminArticlesService.getArticles();
    this.cdr.markForCheck();
  }

  notImplemented(): void {
    alert(`Feature is not implemented yet.`);
  }

  deleteArticle(article: Article): void {
    if (confirm(`Are you sure you want to delete article "${article.title}"?`)) {
      this.adminArticlesService.deleteArticle(article.id).subscribe({
        next: () => {
          this.reloadArticles();
        },
        error: (err) => {
          alert(`Error deleting article: ${err?.message || err}`);
        }
      });
    }
  }

}
