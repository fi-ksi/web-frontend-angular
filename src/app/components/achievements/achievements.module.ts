import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AchievementsRoutingModule } from './achievements-routing.module';
import { PageAchievementsComponent } from './page-achievements/page-achievements.component';
import { TranslateModule } from '@ngx-translate/core';
import { SharedModule } from '../shared/shared.module';


@NgModule({
  declarations: [
    PageAchievementsComponent
  ],
  imports: [
    CommonModule,
    AchievementsRoutingModule,
    TranslateModule,
    SharedModule
  ]
})
export class AchievementsModule { }
