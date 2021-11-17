import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PageTasksComponent } from "./page-tasks/page-tasks.component";
import { PageTaskComponent } from "./page-task/page-task.component";

const routes: Routes = [
  {path: ':id', component: PageTaskComponent},
  {path: '', component: PageTasksComponent, pathMatch: 'full'}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TasksRoutingModule { }
