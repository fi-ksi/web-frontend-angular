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
import { PageAdminEmailComponent } from './page-admin-email/page-admin-email.component';
import { QuillModule } from 'ngx-quill';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AccordionModule } from 'ngx-bootstrap/accordion';
import { PageAdminDiscussionComponent } from './page-admin-discussion/page-admin-discussion.component';
import { AdminWaveSelectorComponent } from './shared/admin-wave-selector/admin-wave-selector.component';
import { PageAdminAchievementsComponent } from './page-admin-achievements/page-admin-achievements.component';
import { PageAdminInstanceConfigComponent } from './page-admin-instance-config/page-admin-instance-config.component';
import { PageAdminWavesComponent } from './page-admin-waves/page-admin-waves.component';
import { PageAdminWavesEditComponent } from './page-admin-waves/page-admin-waves-edit/page-admin-waves-edit.component';
import { DefaultService } from 'src/api/backend';
import { PageAdminYearsComponent } from './page-admin-years/page-admin-years.component';
import { PageAdminYearsEditComponent } from './page-admin-years/page-admin-years-edit/page-admin-years-edit.component';
import { PageAdminArticlesComponent } from './page-admin-articles/page-admin-articles.component';
import { PageAdminArticleEditComponent } from './page-admin-articles/page-admin-article-edit/page-admin-article-edit.component';
import { PageAdminUsersComponent } from './page-admin-users/page-admin-users.component';
import { PageAdminAchievementsEditComponent } from './page-admin-achievements/page-admin-achievements-edit/page-admin-achievements-edit.component';
import { PageAdminExecComponent } from './page-admin-exec/page-admin-exec.component';
import { PageAdminGradingComponent } from './page-admin-grading/page-admin-grading.component';
import { NgbTypeaheadModule, NgbPaginationModule } from "@ng-bootstrap/ng-bootstrap";
import { ExecReportComponent } from './page-admin-exec/exec-report/exec-report.component';
import { PageAdminAchievementsGrantComponent } from './page-admin-achievements/page-admin-achievements-grant/page-admin-achievements-grant.component';


@NgModule({
  declarations: [
    PageAdminRootComponent,
    AdminSidebarComponent,
    PageAdminTasksComponent,
    AdminSectionCardComponent,
    PageAdminMonitorComponent,
    PageAdminEmailComponent,
    PageAdminDiscussionComponent,
    AdminWaveSelectorComponent,
    PageAdminAchievementsComponent,
    PageAdminInstanceConfigComponent,
    PageAdminWavesComponent,
    PageAdminWavesEditComponent,
    PageAdminYearsComponent,
    PageAdminYearsEditComponent,
    PageAdminArticlesComponent,
    PageAdminArticleEditComponent,
    PageAdminUsersComponent,
    PageAdminAchievementsEditComponent,
    PageAdminExecComponent,
    PageAdminGradingComponent,
    ExecReportComponent,
    PageAdminAchievementsGrantComponent,
  ],
  imports: [
    CommonModule,
    AdminRoutingModule,
    TranslateModule,
    SharedModule,
    TooltipModule,
    QuillModule,
    ReactiveFormsModule,
    AccordionModule,
    FormsModule,
    NgbTypeaheadModule,
    NgbPaginationModule
],
  providers: [
    DefaultService // Add DefaultService to the providers array
  ],

})
export class AdminModule { }
