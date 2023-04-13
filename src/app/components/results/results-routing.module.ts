import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PageResultsComponent } from './page-results/page-results.component';

const routes: Routes = [
  {path: '', component: PageResultsComponent, pathMatch: 'full'}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ResultsRoutingModule { }
