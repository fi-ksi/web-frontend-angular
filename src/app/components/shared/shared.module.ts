import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ArticlePreviewComponent } from "./article-preview/article-preview.component";
import { RouterModule } from "@angular/router";
import { SpinnerComponent } from "./spinner/spinner.component";
import { TranslateGenderPipe, TranslateNewItemsPipe, TranslatePointsPipe, TranslateRolePipe } from "../../pipes";
import { DiscussionThreadComponent } from './discussion-thread/discussion-thread.component';
import {
  DiscussionThreadPostsComponent
} from './discussion-thread/discussion-thread-posts/discussion-thread-posts.component';
import { TranslateModule } from "@ngx-translate/core";
import { UsersInlineComponent } from './users-inline/users-inline.component';
import { TooltipModule } from "ngx-bootstrap/tooltip";
import { ReactiveFormsModule } from "@angular/forms";
import { TranslateSkillLevelPipe } from "../../pipes";
import { IconAchievementComponent } from "./icon-achivement/icon-achievement.component";
import { ModalGenericComponent } from "./modal-generic/modal-generic.component";
import { ModalLoginComponent } from "./modal-login/modal-login.component";
import { ModalPostReplyComponent } from "./modal-post-reply/modal-post-reply.component";
import { QuillModule } from "ngx-quill";


@NgModule({
  declarations: [
    ArticlePreviewComponent,
    SpinnerComponent,
    TranslatePointsPipe,
    TranslateNewItemsPipe,
    TranslateRolePipe,
    TranslateSkillLevelPipe,
    TranslateGenderPipe,
    DiscussionThreadComponent,
    DiscussionThreadPostsComponent,
    UsersInlineComponent,
    IconAchievementComponent,
    ModalGenericComponent,
    ModalLoginComponent,
    ModalPostReplyComponent,
  ],
  exports: [
    ArticlePreviewComponent,
    SpinnerComponent,
    TranslatePointsPipe,
    TranslateNewItemsPipe,
    DiscussionThreadComponent,
    UsersInlineComponent,
    TranslateRolePipe,
    TranslateSkillLevelPipe,
    TranslateGenderPipe,
    DiscussionThreadPostsComponent,
    IconAchievementComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    TranslateModule,
    TooltipModule,
    ReactiveFormsModule,
    QuillModule
  ]
})
export class SharedModule {
}
