import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ResultsRoutingModule } from './results-routing.module';
import { PageResultsComponent } from './page-results/page-results.component';
import { TranslateModule } from "@ngx-translate/core";
import { IconAchievementComponent } from './icon-achivement/icon-achievement.component';
import { TooltipModule } from "ngx-bootstrap/tooltip";


@NgModule({
  declarations: [
    PageResultsComponent,
    IconAchievementComponent
  ],
  imports: [
    CommonModule,
    ResultsRoutingModule,
    TranslateModule,
    TooltipModule
  ]
})
export class ResultsModule { }
