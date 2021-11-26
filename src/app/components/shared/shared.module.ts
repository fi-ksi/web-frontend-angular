import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ArticlePreviewComponent } from "./article-preview/article-preview.component";
import { RouterModule } from "@angular/router";
import { SpinnerComponent } from "./spinner/spinner.component";
import { TranslateNewItemsPipe, TranslatePointsPipe, TranslateRolePipe } from "../../pipes";
import { DiscussionThreadComponent } from './discussion-thread/discussion-thread.component';
import { DiscussionThreadPostsComponent } from './discussion-thread/discussion-thread-posts/discussion-thread-posts.component';
import { TranslateModule } from "@ngx-translate/core";
import { UsersInlineComponent } from './users-inline/users-inline.component';



@NgModule({
  declarations: [
    ArticlePreviewComponent,
    SpinnerComponent,
    TranslatePointsPipe,
    TranslateNewItemsPipe,
    TranslateRolePipe,
    DiscussionThreadComponent,
    DiscussionThreadPostsComponent,
    UsersInlineComponent
  ],
  exports: [
    ArticlePreviewComponent,
    SpinnerComponent,
    TranslatePointsPipe,
    TranslateNewItemsPipe,
    DiscussionThreadComponent,
    UsersInlineComponent,
    TranslateRolePipe
  ],
  imports: [
    CommonModule,
    RouterModule,
    TranslateModule
  ]
})
export class SharedModule { }
