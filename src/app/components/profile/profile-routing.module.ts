import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PageProfileComponent } from './page-profile/page-profile.component';
import { PageProfileMyComponent } from './page-profile-my/page-profile-my.component';
import { ROUTES } from '../../../routes/routes';

const routes: Routes = [
  {path: ROUTES.profile.settings._, component: PageProfileMyComponent},
  {path: '', component: PageProfileComponent, pathMatch: 'full'},
  {path: ':id', component: PageProfileComponent}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ProfileRoutingModule { }
