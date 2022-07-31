import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AdminRoutingModule } from './admin-routing.module';
import { PageAdminRootComponent } from './page-admin-root/page-admin-root.component';
import { AdminSidebarComponent } from './admin-sidebar/admin-sidebar.component';
import { TranslateModule } from '@ngx-translate/core';
import { PageAdminTasksComponent } from './page-admin-tasks/page-admin-tasks.component';


@NgModule({
  declarations: [
    PageAdminRootComponent,
    AdminSidebarComponent,
    PageAdminTasksComponent
  ],
  imports: [
    CommonModule,
    AdminRoutingModule,
    TranslateModule
  ]
})
export class AdminModule { }
