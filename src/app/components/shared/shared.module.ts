import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ArticlePreviewComponent } from "./article-preview/article-preview.component";
import { RouterModule } from "@angular/router";
import { SpinnerComponent } from "./spinner/spinner.component";
import { ModalTemplatesComponent } from './modal-templates/modal-templates.component';



@NgModule({
  declarations: [
    ArticlePreviewComponent,
    SpinnerComponent,
    ModalTemplatesComponent
  ],
  exports: [
    ArticlePreviewComponent,
    SpinnerComponent
  ],
  imports: [
    CommonModule,
    RouterModule
  ]
})
export class SharedModule { }
