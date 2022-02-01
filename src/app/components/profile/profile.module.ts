import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ProfileRoutingModule } from './profile-routing.module';
import { PageProfileComponent } from './page-profile/page-profile.component';
import { SharedModule } from "../shared/shared.module";
import { TranslateModule } from "@ngx-translate/core";
import { ProfileOrgTaskThumbnailComponent } from './page-profile/profile-org-task-thumbnail/profile-org-task-thumbnail.component';
import { TooltipModule } from "ngx-bootstrap/tooltip";
import { ProgressbarModule } from "ngx-bootstrap/progressbar";
import { PageProfileMyComponent } from './page-profile-my/page-profile-my.component';
import { ReactiveFormsModule } from "@angular/forms";


@NgModule({
  declarations: [
    PageProfileComponent,
    ProfileOrgTaskThumbnailComponent,
    PageProfileMyComponent
  ],
    imports: [
        CommonModule,
        ProfileRoutingModule,
        SharedModule,
        TranslateModule,
        TooltipModule,
        ProgressbarModule,
        ReactiveFormsModule
    ]
})
export class ProfileModule { }
