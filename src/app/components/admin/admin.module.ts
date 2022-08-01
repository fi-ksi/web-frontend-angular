import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AdminRoutingModule } from './admin-routing.module';
import { PageAdminRootComponent } from './page-admin-root/page-admin-root.component';
import { AdminSidebarComponent } from './admin-sidebar/admin-sidebar.component';
import { TranslateModule } from '@ngx-translate/core';
import { PageAdminTasksComponent } from './page-admin-tasks/page-admin-tasks.component';
import { AdminSectionCardComponent } from './page-admin-root/admin-section-card/admin-section-card.component';
import { PageAdminMonitorComponent } from './page-admin-monitor/page-admin-monitor.component';
import { SharedModule } from '../shared/shared.module';
import { TooltipModule } from 'ngx-bootstrap/tooltip';


@NgModule({
  declarations: [
    PageAdminRootComponent,
    AdminSidebarComponent,
    PageAdminTasksComponent,
    AdminSectionCardComponent,
    PageAdminMonitorComponent
  ],
  imports: [
    CommonModule,
    AdminRoutingModule,
    TranslateModule,
    SharedModule,
    TooltipModule
  ]
})
export class AdminModule { }
