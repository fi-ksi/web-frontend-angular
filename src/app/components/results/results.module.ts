import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ResultsRoutingModule } from './results-routing.module';
import { PageResultsComponent } from './page-results/page-results.component';
import { TranslateModule } from '@ngx-translate/core';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { SharedModule } from '../shared/shared.module';


@NgModule({
  declarations: [
    PageResultsComponent,
  ],
  imports: [
    CommonModule,
    ResultsRoutingModule,
    TranslateModule,
    TooltipModule,
    SharedModule
  ]
})
export class ResultsModule { }
