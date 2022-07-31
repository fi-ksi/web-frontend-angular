import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PageAdminRootComponent } from './page-admin-root/page-admin-root.component';
import { ROUTES } from '../../../routes/routes';
import { PageAdminTasksComponent } from './page-admin-tasks/page-admin-tasks.component';
import { PageAdminMonitorComponent } from './page-admin-monitor/page-admin-monitor.component';

const routes: Routes = [
  {path: '', component: PageAdminRootComponent},
  {path: ROUTES.admin.tasks, component: PageAdminTasksComponent},
  {path: ROUTES.admin.monitor, component: PageAdminMonitorComponent}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }
