import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DiscussionRoutingModule } from './discussion-routing.module';
import { PageDiscussionsComponent } from './page-discussions/page-discussions.component';
import { SharedModule } from "../shared/shared.module";
import { TranslateModule } from "@ngx-translate/core";


@NgModule({
  declarations: [
    PageDiscussionsComponent
  ],
    imports: [
        CommonModule,
        DiscussionRoutingModule,
        SharedModule,
        TranslateModule
    ]
})
export class DiscussionModule { }
