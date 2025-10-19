import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { Observable } from 'rxjs';
import { Article } from 'src/api/backend';
import { IconService, ModalService, RoutesService, YearsService } from 'src/app/services';
import { AdminArticlesService } from 'src/app/services/admin/admin-articles.service';
import { AdminBaseComponent } from '../base/admin-base.component';

@Component({
  selector: 'ksi-page-admin-articles',
  templateUrl: './page-admin-articles.component.html',
  styleUrls: ['./page-admin-articles.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class PageAdminArticlesComponent extends AdminBaseComponent<Article> implements OnInit {
  loadItemsFunction = () => this.adminArticlesService.getArticles();
  deleteFunction = (itemId: number) => this.adminArticlesService.deleteArticle(itemId);

  constructor(
    public icon: IconService,
    public routes: RoutesService,
    public years: YearsService,
    public cdr: ChangeDetectorRef,
    public modal: ModalService,
    public adminArticlesService: AdminArticlesService
  ) { 
    super(modal, cdr);
  }

  ngOnInit(): void {
    super.ngOnInit();
  }
}
