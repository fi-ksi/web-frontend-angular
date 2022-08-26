import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ProfileRoutingModule } from './profile-routing.module';
import { PageProfileComponent } from './page-profile/page-profile.component';
import { SharedModule } from '../shared/shared.module';
import { TranslateModule } from '@ngx-translate/core';
import { ProfileTaskThumbnailComponent } from './page-profile/profile-task-thumbnail/profile-task-thumbnail.component';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { ProgressbarModule } from 'ngx-bootstrap/progressbar';
import { PageProfileMyComponent } from './page-profile-my/page-profile-my.component';
import { ReactiveFormsModule } from '@angular/forms';
import { PdfViewerModule } from 'ng2-pdf-viewer';


@NgModule({
  declarations: [
    PageProfileComponent,
    ProfileTaskThumbnailComponent,
    PageProfileMyComponent
  ],
  imports: [
    CommonModule,
    ProfileRoutingModule,
    SharedModule,
    TranslateModule,
    TooltipModule,
    ProgressbarModule,
    ReactiveFormsModule,
    PdfViewerModule
  ]
})
export class ProfileModule { }
