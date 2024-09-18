import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PageWelcomeComponent } from './components/root/page-welcome/page-welcome.component';
import { PageScheduleComponent } from './components/root/page-schedule/page-schedule.component';
import { PageNotFoundComponent } from './components/root/page-not-found/page-not-found.component';
import { PageForbiddenComponent } from './components/root/page-forbidden/page-forbidden.component';
import { ROUTES } from '../routes/routes';
import { PagePrivacyPolicyComponent } from './components/privacy-policy/page-privacy-policy/page-privacy-policy.component';

const routes: Routes = [
  { path: '',   component: PageWelcomeComponent, pathMatch: 'full' },
  { path: '403', component: PageForbiddenComponent },
  { path: '404', component: PageNotFoundComponent },
  { path: ROUTES.privacyPolicy, loadChildren: () => import('./components/privacy-policy/privacy-policy.module').then((m) => m.PrivacyPolicyModule) },
  { path: ROUTES.news, loadChildren: () => import('./components/news/news.module').then((m) => m.NewsModule)},
  { path: ROUTES.about, loadChildren: () => import('./components/about/about.module').then((m) => m.AboutModule)},
  { path: ROUTES.schedule,  component: PageScheduleComponent, pathMatch: 'full'},
  { path: ROUTES.results, loadChildren: () => import('./components/results/results.module').then((m) => m.ResultsModule)},
  { path: ROUTES.tasks._, loadChildren: () => import('./components/tasks/tasks.module').then((m) => m.TasksModule)},
  { path: ROUTES.discussion, loadChildren: () => import('./components/discussion/discussion.module').then((m) => m.DiscussionModule)},
  { path: ROUTES.profile._, loadChildren: () => import('./components/profile/profile.module').then((m) => m.ProfileModule)},
  { path: ROUTES.achievements, loadChildren: () => import('./components/achievements/achievements.module').then((m) => m.AchievementsModule)},
  { path: ROUTES.admin._, loadChildren: () => import('./components/admin/admin.module').then((m) => m.AdminModule)},
  { path: '**', component: PageNotFoundComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
