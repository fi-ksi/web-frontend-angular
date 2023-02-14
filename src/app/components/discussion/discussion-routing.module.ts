import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PageDiscussionsComponent } from './page-discussions/page-discussions.component';
import { PageDiscussionThreadComponent } from './page-discussion-thread/page-discussion-thread.component';

const routes: Routes = [
  {path: '', component: PageDiscussionsComponent, pathMatch: 'full'},
  {path: ':id', component: PageDiscussionThreadComponent},
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DiscussionRoutingModule { }
