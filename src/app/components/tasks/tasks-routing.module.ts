import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PageTasksComponent } from "./page-tasks/page-tasks.component";

const routes: Routes = [
  {path: '', component: PageTasksComponent, pathMatch: 'full'}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TasksRoutingModule { }
