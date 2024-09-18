import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FooterComponent } from './footer/footer.component';
import { ModalChangelogComponent } from '../shared/modal-changelog/modal-changelog.component';
import { NavbarComponent } from './navbar/navbar.component';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';
import { PageWelcomeComponent } from './page-welcome/page-welcome.component';
import { PageScheduleComponent } from './page-schedule/page-schedule.component';
import { SharedModule } from '../shared/shared.module';
import { TranslateModule } from '@ngx-translate/core';
import { CarouselModule } from 'ngx-bootstrap/carousel';
import { CollapseModule } from 'ngx-bootstrap/collapse';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { PageForbiddenComponent } from './page-forbidden/page-forbidden.component';

@NgModule({
  declarations: [
    FooterComponent,
    ModalChangelogComponent,
    NavbarComponent,
    PageNotFoundComponent,
    PageWelcomeComponent,
    PageScheduleComponent,
    PageForbiddenComponent
  ],
  exports: [
    FooterComponent,
    ModalChangelogComponent,
    NavbarComponent,
    PageNotFoundComponent,
    PageWelcomeComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    TranslateModule,
    CarouselModule,
    CollapseModule,
    ReactiveFormsModule,
    RouterModule,
    NgbDropdownModule,
  ]
})
export class RootModule {
}
