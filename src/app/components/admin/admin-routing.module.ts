import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PageAdminRootComponent } from './page-admin-root/page-admin-root.component';
import { ROUTES } from '../../../routes/routes';
import { PageAdminTasksComponent } from './page-admin-tasks/page-admin-tasks.component';
import { PageAdminMonitorComponent } from './page-admin-monitor/page-admin-monitor.component';
import { PageAdminEmailComponent } from './page-admin-email/page-admin-email.component';
import {PageAdminDiscussionComponent} from './page-admin-discussion/page-admin-discussion.component';
import {PageAdminAchievementsComponent} from './page-admin-achievements/page-admin-achievements.component';
import {PageAdminInstanceConfigComponent} from './page-admin-instance-config/page-admin-instance-config.component';

const routes: Routes = [
  {path: '', component: PageAdminRootComponent},
  {path: ROUTES.admin.tasks, component: PageAdminTasksComponent},
  {path: ROUTES.admin.monitor, component: PageAdminMonitorComponent},
  {path: ROUTES.admin.email, component: PageAdminEmailComponent},
  {path: ROUTES.admin.discussion, component: PageAdminDiscussionComponent},
  {path: ROUTES.admin.achievements, component: PageAdminAchievementsComponent},
  {path: ROUTES.admin.instanceConfig, component: PageAdminInstanceConfigComponent},
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }
