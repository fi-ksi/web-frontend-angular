import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PageAchievementsComponent } from "./page-achievements/page-achievements.component";

const routes: Routes = [
  {path: '', component: PageAchievementsComponent},
  {path: ':id', component: PageAchievementsComponent}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AchievementsRoutingModule { }
