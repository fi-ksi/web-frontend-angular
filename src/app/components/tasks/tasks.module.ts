import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TasksRoutingModule } from './tasks-routing.module';
import { PageTasksComponent } from './page-tasks/page-tasks.component';
import { WaveComponent } from './wave/wave.component';
import { AccordionModule } from "ngx-bootstrap/accordion";
import { TranslateModule } from "@ngx-translate/core";
import { SharedModule } from "../shared/shared.module";
import { TaskIconComponent } from './task-icon/task-icon.component';
import { TasksGraphComponent } from './tasks-graph/tasks-graph.component';


@NgModule({
  declarations: [
    PageTasksComponent,
    WaveComponent,
    TaskIconComponent,
    TasksGraphComponent
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
