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
import { ReactiveFormsModule } from "@angular/forms";
import { TooltipModule } from "ngx-bootstrap/tooltip";
import { PageTaskComponent } from './page-task/page-task.component';
import { TaskBodyComponent } from './task-body/task-body.component';
import { TaskModuleComponent } from './task-module/task-module.component';
import { TaskModuleTextComponent } from './task-module/task-module-text/task-module-text.component';
import { TaskModuleQuizComponent } from './task-module/task-module-quiz/task-module-quiz.component';


@NgModule({
  declarations: [
    PageTasksComponent,
    WaveComponent,
    TaskIconComponent,
    TasksGraphComponent,
    PageTaskComponent,
    TaskBodyComponent,
    TaskModuleComponent,
    TaskModuleTextComponent,
    TaskModuleQuizComponent
  ],
    imports: [
        CommonModule,
        TasksRoutingModule,
        AccordionModule,
        TranslateModule,
        SharedModule,
        ReactiveFormsModule,
        TooltipModule
    ]
})
export class TasksModule { }
