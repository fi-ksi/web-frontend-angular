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
import { TaskModuleProgrammingComponent } from './task-module/task-module-programming/task-module-programming.component';
import { TaskModuleGeneralComponent } from './task-module/task-module-general/task-module-general.component';
import { ProgressbarModule } from "ngx-bootstrap/progressbar";
import { TaskModuleSortableComponent } from './task-module/task-module-sortable/task-module-sortable.component';
import { TaskModuleSortableItemComponent } from './task-module/task-module-sortable/task-module-sortable-item/task-module-sortable-item.component';
import {
    TaskModuleSortablePlaceComponent
} from "./task-module/task-module-sortable/task-module-sortable-place/task-module-sortable-place.component";
import { TaskCollapsibleComponent } from './task-body/task-collapsible/task-collapsible.component';
import { WaveTaskLinearComponent } from './wave/wave-task-linear/wave-task-linear.component';
import { TaskTipComponent } from './task-body/task-tip/task-tip.component';


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
        TaskModuleQuizComponent,
        TaskModuleProgrammingComponent,
        TaskModuleGeneralComponent,
        TaskModuleSortableComponent,
        TaskModuleSortableItemComponent,
        TaskModuleSortablePlaceComponent,
        TaskCollapsibleComponent,
        WaveTaskLinearComponent,
        TaskTipComponent
    ],
    imports: [
        CommonModule,
        TasksRoutingModule,
        AccordionModule,
        TranslateModule,
        SharedModule,
        ReactiveFormsModule,
        TooltipModule,
        ProgressbarModule
    ]
})
export class TasksModule { }
