import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ProfileRoutingModule } from './profile-routing.module';
import { PageProfileComponent } from './page-profile/page-profile.component';
import { SharedModule } from "../shared/shared.module";
import { TranslateModule } from "@ngx-translate/core";
import { ProfileOrgTaskThumbnailComponent } from './page-profile/profile-org-task-thumbnail/profile-org-task-thumbnail.component';


@NgModule({
  declarations: [
    PageProfileComponent,
    ProfileOrgTaskThumbnailComponent
  ],
  imports: [
    CommonModule,
    ProfileRoutingModule,
    SharedModule,
    TranslateModule
  ]
})
export class ProfileModule { }
