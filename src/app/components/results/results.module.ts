import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ResultsRoutingModule } from './results-routing.module';
import { PageResultsComponent } from './page-results/page-results.component';
import { TranslateModule } from "@ngx-translate/core";


@NgModule({
  declarations: [
    PageResultsComponent
  ],
  imports: [
    CommonModule,
    ResultsRoutingModule,
    TranslateModule
  ]
})
export class ResultsModule { }
