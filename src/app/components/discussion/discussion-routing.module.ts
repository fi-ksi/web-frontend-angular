import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PageDiscussionsComponent } from "./page-discussions/page-discussions.component";

const routes: Routes = [
  {path: '', component: PageDiscussionsComponent, pathMatch: 'full'}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DiscussionRoutingModule { }
