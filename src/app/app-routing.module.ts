import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PageWelcomeComponent } from "./components/root/page-welcome/page-welcome.component";
import { PageNotFoundComponent } from "./components/root/page-not-found/page-not-found.component";

const routes: Routes = [
  { path: 'home', component: PageWelcomeComponent },
  { path: '',   redirectTo: '/home', pathMatch: 'full' },
  { path: 'news', loadChildren: () => import('./components/news/news.module').then((m) => m.NewsModule)},
  { path: 'about', loadChildren: () => import('./components/about/about.module').then((m) => m.AboutModule)},
  { path: 'results', loadChildren: () => import('./components/results/results.module').then((m) => m.ResultsModule)},
  { path: 'tasks', loadChildren: () => import('./components/tasks/tasks.module').then((m) => m.TasksModule)},
  { path: 'discussion', loadChildren: () => import('./components/discussion/discussion.module').then((m) => m.DiscussionModule)},
  { path: 'profile', loadChildren: () => import('./components/profile/profile.module').then((m) => m.ProfileModule)},
  { path: 'achievements', loadChildren: () => import('./components/achievements/achievements.module').then((m) => m.AchievementsModule)},
  { path: '**', component: PageNotFoundComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
