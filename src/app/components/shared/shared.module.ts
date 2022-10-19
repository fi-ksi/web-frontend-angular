import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ArticlePreviewComponent } from './article-preview/article-preview.component';
import { RouterModule } from '@angular/router';
import { SpinnerComponent } from './spinner/spinner.component';
import { TranslateGenderPipe, TranslateNewItemsPipe, TranslatePointsPipe, TranslateRolePipe } from '../../pipes';
import { DiscussionThreadComponent } from './discussion-thread/discussion-thread.component';
import {
  DiscussionThreadPostsComponent
} from './discussion-thread/discussion-thread-posts/discussion-thread-posts.component';
import { TranslateModule } from '@ngx-translate/core';
import { UsersInlineComponent } from './users-inline/users-inline.component';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateSkillLevelPipe } from '../../pipes';
import { IconAchievementComponent } from './icon-achivement/icon-achievement.component';
import { ModalGenericComponent } from './modal-generic/modal-generic.component';
import { ModalLoginComponent } from './modal-login/modal-login.component';
import { ModalPostReplyComponent } from './modal-post-reply/modal-post-reply.component';
import { QuillModule } from 'ngx-quill';
import { ModalServerErrorComponent } from './modal-server-error/modal-server-error.component';
import { ModalRegisterComponent } from './modal-register/modal-register.component';
import { ModalTermsOfUseComponent } from './modal-terms-of-use/modal-terms-of-use.component';
import { AutoThemeDirective } from './auto-theme.directive';
import { ModalYesNoComponent } from './modal-yes-no/modal-yes-no.component';
import { ModalResetPasswordComponent } from './modal-reset-password/modal-reset-password.component';
import { ModalFeedbackComponent } from './modal-feedback/modal-feedback.component';
import { FeedbackComponent } from './feedback/feedback.component';
import { RatingModule } from 'ngx-bootstrap/rating';
import { ClickableUserNameComponent } from './clickable-user-name/clickable-user-name.component';
import {KsiDatePipe} from '../../pipes/shared/ksi-date.pipe';
import { TermsOfUseComponent } from './terms-of-use/terms-of-use.component';

@NgModule({
  declarations: [
    ArticlePreviewComponent,
    SpinnerComponent,
    TranslatePointsPipe,
    TranslateNewItemsPipe,
    TranslateRolePipe,
    TranslateSkillLevelPipe,
    TranslateGenderPipe,
    KsiDatePipe,
    DiscussionThreadComponent,
    DiscussionThreadPostsComponent,
    UsersInlineComponent,
    IconAchievementComponent,
    ModalGenericComponent,
    ModalLoginComponent,
    ModalPostReplyComponent,
    ModalServerErrorComponent,
    ModalRegisterComponent,
    ModalTermsOfUseComponent,
    AutoThemeDirective,
    ModalYesNoComponent,
    ModalResetPasswordComponent,
    ModalFeedbackComponent,
    FeedbackComponent,
    ClickableUserNameComponent,
    TermsOfUseComponent,
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
    KsiDatePipe,
    DiscussionThreadPostsComponent,
    IconAchievementComponent,
    AutoThemeDirective,
    FeedbackComponent,
    ClickableUserNameComponent,
    TermsOfUseComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    TranslateModule,
    TooltipModule,
    ReactiveFormsModule,
    QuillModule,
    RatingModule,
    FormsModule
  ]
})
export class SharedModule {
}
