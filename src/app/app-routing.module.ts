import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PageWelcomeComponent } from "./components/root/page-welcome/page-welcome.component";

const routes: Routes = [
  { path: 'home', component: PageWelcomeComponent },
  { path: '',   redirectTo: '/home', pathMatch: 'full' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
