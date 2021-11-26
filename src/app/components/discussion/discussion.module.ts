import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DiscussionRoutingModule } from './discussion-routing.module';
import { PageDiscussionsComponent } from './page-discussions/page-discussions.component';
import { SharedModule } from "../shared/shared.module";
import { TranslateModule } from "@ngx-translate/core";
import { PageDiscussionThreadComponent } from './page-discussion-thread/page-discussion-thread.component';


@NgModule({
  declarations: [
    PageDiscussionsComponent,
    PageDiscussionThreadComponent
  ],
    imports: [
        CommonModule,
        DiscussionRoutingModule,
        SharedModule,
        TranslateModule
    ]
})
export class DiscussionModule { }
