import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { EditMode } from 'src/app/models/EditMode';
import { IconService, ModalService, RoutesService, YearsService } from 'src/app/services';
import { AdminArticlesService } from 'src/app/services/admin/admin-articles.service';
import { AdminWavesService } from 'src/app/services/admin/admin-waves.service';
import { AdminBaseEditComponent } from '../../base/admin-edit-base.component';
import { Article } from 'src/api/backend';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'ksi-page-admin-article-edit',
  templateUrl: './page-admin-article-edit.component.html',
  styleUrls: ['./page-admin-article-edit.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PageAdminArticleEditComponent extends AdminBaseEditComponent<Article> implements OnInit {
  form = this.fb.group({
    title: ['', [Validators.required]],
    body: ['', [Validators.required]],
    published: [false],
    year: [this.years.selected?.id], // User won't set this - it's for better DevEx when submitting
    time_published: [new Date().toISOString(), [Validators.required]],
    picture: [null]
  });

  createFunction = () => this.adminArticlesService.createArticle({ article: this.form.value });
  updateFunction = () => this.adminArticlesService.updateArticle(this.itemId, { article: this.form.value });
  loadItemFunction = (itemId: number) => this.adminArticlesService.getArticleById(itemId).pipe(map(response => response!));

  files: any;

  constructor(
    public icon: IconService,
    public routes: RoutesService,
    public years: YearsService,
    public router: Router,
    public fb: FormBuilder,
    public cdRef: ChangeDetectorRef,
    public modal: ModalService,
    public adminArticlesService: AdminArticlesService,
  ) {
    super(router, routes, modal, cdRef);
  }

  ngOnInit(): void {
    super.ngOnInit();
    this.loadFiles();
  }

  loadFiles(): void {
    this.adminArticlesService.getFilesForArticle(this.itemId).subscribe(files => {
      this.files = files || [];
      this.cdRef.markForCheck();
    });
  }

  deleteFile(file: any) {
    this.modal.yesNo('Delete file', false).subscribe(confirmed => {
      if (confirmed) {
        this.adminArticlesService.deleteFileFromArticle(this.itemId, file).subscribe(() => {
          this.loadFiles();
        });
      }
    });
  }

  uploadFile() {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.onchange = (event: any) => {
      let files = event.target.files;
      console.log(files);
      files = Array.from(files);
      files.forEach((element: any) => {
        console.log(element)
      });
      this.adminArticlesService.uploadFileToArticle(this.itemId, files).subscribe(() => {
        this.loadFiles();
      });
    };
    fileInput.click();
  }
  
  copyFileUrl(file: any) {
    console.log(file);
    let url = `${environment.backend}content/articles/${this.itemId}/${file}`;
    navigator.clipboard.writeText(url).then(() => {
      alert('URL copied to clipboard');
    });    
  }

}