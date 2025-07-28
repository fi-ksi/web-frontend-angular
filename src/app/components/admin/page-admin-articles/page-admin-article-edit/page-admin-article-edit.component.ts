import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { EditMode } from 'src/app/models/EditMode';
import { IconService, RoutesService, YearsService } from 'src/app/services';
import { AdminArticlesService } from 'src/app/services/admin/admin-articles.service';
import { AdminWavesService } from 'src/app/services/admin/admin-waves.service';

@Component({
  selector: 'ksi-page-admin-article-edit',
  templateUrl: './page-admin-article-edit.component.html',
  styleUrls: ['./page-admin-article-edit.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PageAdminArticleEditComponent implements OnInit {
  editMode: EditMode;
  EditMode = {
    New: 'New',
    Edit: 'Edit'
  };

  articleId: number;

  form = this.fb.group({
    title: [''],
    body: [''],
    published: [false],
    year: [this.years.selected?.id], // User won't set this - it's for better DevEx when submitting
    time_published: [null], // Store as ISO string
    picture: [null]
  });

  constructor(
    public icon: IconService,
    public routes: RoutesService,
    public years: YearsService,
    public router: Router,
    public fb: FormBuilder,
    private cdRef: ChangeDetectorRef,
    private adminArticlesService: AdminArticlesService
  ) { }

  ngOnInit(): void {
    this.articleId = Number.parseInt(this.router.url.split('/').pop() || '0', 10);

    this.editMode = this.articleId == 0 ? EditMode.New : EditMode.Update;

    if (this.editMode === EditMode.Update) {
      this.adminArticlesService.getArticleById(this.articleId).subscribe({
        next: (article) => {
          if (article) {
            this.form.patchValue(article);
            this.cdRef.markForCheck();
          } else {
            alert('Article not found');
            this.router.navigate([this.routes.routes.admin._, this.routes.routes.admin.articles._]);
          }
        }
      });
    }

  }

}
