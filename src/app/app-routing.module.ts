import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PageWelcomeComponent } from "./components/root/page-welcome/page-welcome.component";
import { PageNotFoundComponent } from "./components/root/page-not-found/page-not-found.component";

const routes: Routes = [
  { path: 'home', component: PageWelcomeComponent },
  { path: '',   redirectTo: '/home', pathMatch: 'full' },
  { path: 'news', loadChildren: () => import('./components/news/news.module').then((m) => m.NewsModule)},
  { path: '**', component: PageNotFoundComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
