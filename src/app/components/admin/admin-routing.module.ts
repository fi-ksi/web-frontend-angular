import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PageAdminRootComponent } from './page-admin-root/page-admin-root.component';
import { ROUTES } from '../../../routes/routes';
import { PageAdminTasksComponent } from './page-admin-tasks/page-admin-tasks.component';
import { PageAdminMonitorComponent } from './page-admin-monitor/page-admin-monitor.component';
import { PageAdminEmailComponent } from './page-admin-email/page-admin-email.component';
import { PageAdminDiscussionComponent } from './page-admin-discussion/page-admin-discussion.component';
import { PageAdminAchievementsComponent } from './page-admin-achievements/page-admin-achievements.component';
import { PageAdminInstanceConfigComponent } from './page-admin-instance-config/page-admin-instance-config.component';
import { PageAdminWavesComponent } from './page-admin-waves/page-admin-waves.component';
import { PageAdminWavesEditComponent } from './page-admin-waves/page-admin-waves-edit/page-admin-waves-edit.component';
import { PageAdminYearsComponent } from './page-admin-years/page-admin-years.component';
import { PageAdminYearsEditComponent } from './page-admin-years/page-admin-years-edit/page-admin-years-edit.component';
import { PageAdminArticlesComponent } from './page-admin-articles/page-admin-articles.component';
import { PageAdminArticleEditComponent } from './page-admin-articles/page-admin-article-edit/page-admin-article-edit.component';
import { PageAdminAchievementsEditComponent } from './page-admin-achievements/page-admin-achievements-edit/page-admin-achievements-edit.component';
import { PageAdminExecComponent } from './page-admin-exec/page-admin-exec.component';
import { PageAdminUsersComponent } from './page-admin-users/page-admin-users.component';
import { PageAdminGradingComponent } from './page-admin-grading/page-admin-grading.component';
import { PageAdminAchievementsGrantComponent } from './page-admin-achievements/page-admin-achievements-grant/page-admin-achievements-grant.component';

const routes: Routes = [
  { path: '', component: PageAdminRootComponent },
  { path: ROUTES.admin.tasks, component: PageAdminTasksComponent },
  { path: ROUTES.admin.monitor, component: PageAdminMonitorComponent },
  { path: ROUTES.admin.email, component: PageAdminEmailComponent },
  { path: ROUTES.admin.discussion, component: PageAdminDiscussionComponent },
  { path: ROUTES.admin.instanceConfig, component: PageAdminInstanceConfigComponent },
  { path: ROUTES.admin.exec, component: PageAdminExecComponent },
  { path: ROUTES.admin.users, component: PageAdminUsersComponent },
  { path: ROUTES.admin.grading, component: PageAdminGradingComponent},

  { path: ROUTES.admin.achievements._, component: PageAdminAchievementsComponent },
  { path: ROUTES.admin.achievements._ + "/" + ROUTES.admin.achievements.edit + "/:achievementId", component: PageAdminAchievementsEditComponent },
  { path: ROUTES.admin.achievements._ + "/" + ROUTES.admin.achievements.grant, component: PageAdminAchievementsGrantComponent },
  
  { path: ROUTES.admin.waves._, component: PageAdminWavesComponent },
  { path: ROUTES.admin.waves._ + "/" + ROUTES.admin.waves.edit + "/:waveId", component: PageAdminWavesEditComponent },
  
  { path: ROUTES.admin.years._, component: PageAdminYearsComponent },
  { path: ROUTES.admin.years._ + "/" + ROUTES.admin.years.edit + "/:yearId", component: PageAdminYearsEditComponent },
  
  { path: ROUTES.admin.articles._, component: PageAdminArticlesComponent },
  { path: ROUTES.admin.articles._ + "/" + ROUTES.admin.articles.edit + "/:articleId", component: PageAdminArticleEditComponent },

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }
