import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TasksRoutingModule } from './tasks-routing.module';
import { PageTasksComponent } from './page-tasks/page-tasks.component';
import { WaveComponent } from './wave/wave.component';
import { AccordionModule } from "ngx-bootstrap/accordion";
import { TranslateModule } from "@ngx-translate/core";
import { SharedModule } from "../shared/shared.module";


@NgModule({
  declarations: [
    PageTasksComponent,
    WaveComponent
  ],
  imports: [
    CommonModule,
    TasksRoutingModule,
    AccordionModule,
    TranslateModule,
    SharedModule
  ]
})
export class TasksModule { }
