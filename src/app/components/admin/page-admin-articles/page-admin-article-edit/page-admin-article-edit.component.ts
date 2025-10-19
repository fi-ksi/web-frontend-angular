import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { EditMode } from 'src/app/models/EditMode';
import { IconService, ModalService, RoutesService, YearsService } from 'src/app/services';
import { AdminArticlesService } from 'src/app/services/admin/admin-articles.service';
import { AdminWavesService } from 'src/app/services/admin/admin-waves.service';
import { AdminBaseEditComponent } from '../../base/admin-edit-base.component';
import { Article } from 'src/api/backend';
import { map } from 'rxjs/operators';

@Component({
  selector: 'ksi-page-admin-article-edit',
  templateUrl: './page-admin-article-edit.component.html',
  styleUrls: ['./page-admin-article-edit.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PageAdminArticleEditComponent extends AdminBaseEditComponent<Article> implements OnInit {
  form = this.fb.group({
    title: [''],
    body: [''],
    published: [false],
    year: [this.years.selected?.id], // User won't set this - it's for better DevEx when submitting
    time_published: [null],
    picture: [null]
  });
  date_fields_to_fix: string[] = ['time_published'];

  createFunction = () => this.adminArticlesService.createArticle({ article: this.form.value });
  updateFunction = () => this.adminArticlesService.updateArticle(this.itemId, { article: this.form.value });
  loadItemFunction = (itemId: number) => this.adminArticlesService.getArticleById(itemId).pipe(map(response => response!));

  constructor(
    public icon: IconService,
    public routes: RoutesService,
    public years: YearsService,
    public router: Router,
    public fb: FormBuilder,
    public cdRef: ChangeDetectorRef,
    public modal: ModalService,
    public adminArticlesService: AdminArticlesService
  ) {
    super(router, routes, modal, cdRef);
  }

  ngOnInit(): void {
    super.ngOnInit();
    }
}
