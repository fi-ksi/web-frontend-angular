import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ArticlePreviewComponent } from "./article-preview/article-preview.component";
import { RouterModule } from "@angular/router";
import { SpinnerComponent } from "./spinner/spinner.component";
import { TranslateNewItemsPipe, TranslatePointsPipe } from "../../pipes";
import { DiscussionThreadComponent } from './discussion-thread/discussion-thread.component';
import { DiscussionThreadPostsComponent } from './discussion-thread/discussion-thread-posts/discussion-thread-posts.component';



@NgModule({
  declarations: [
    ArticlePreviewComponent,
    SpinnerComponent,
    TranslatePointsPipe,
    TranslateNewItemsPipe,
    DiscussionThreadComponent,
    DiscussionThreadPostsComponent
  ],
    exports: [
        ArticlePreviewComponent,
        SpinnerComponent,
        TranslatePointsPipe,
        TranslateNewItemsPipe,
        DiscussionThreadComponent
    ],
  imports: [
    CommonModule,
    RouterModule
  ]
})
export class SharedModule { }
