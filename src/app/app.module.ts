import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NavbarComponent } from './components/root/navbar/navbar.component';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { FooterComponent } from './components/root/footer/footer.component';
import { AchievementService, BackendService, ThemeService, VersionService, YearsService } from './services';
import { WindowService } from './services';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { KsiTitleService } from "./services";
import { PageWelcomeComponent } from './components/root/page-welcome/page-welcome.component';
import { PageNotFoundComponent } from './components/root/page-not-found/page-not-found.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CarouselModule } from "ngx-bootstrap/carousel";
import { CollapseModule } from "ngx-bootstrap/collapse";
import { ModalChangelogComponent } from './components/root/modal-changelog/modal-changelog.component';
import { BsModalService } from "ngx-bootstrap/modal";
import { ReactiveFormsModule } from "@angular/forms";
import { SharedModule } from "./components/shared/shared.module";

export function HttpLoaderFactory(http: HttpClient): TranslateHttpLoader {
  return new TranslateHttpLoader(http);
}

@NgModule({
  declarations: [
    AppComponent,
    NavbarComponent,
    FooterComponent,
    PageWelcomeComponent,
    PageNotFoundComponent,
    ModalChangelogComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    TranslateModule.forRoot({
      defaultLanguage: 'cs',
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      }
    }),
    NgbModule,
    BrowserAnimationsModule,
    CarouselModule,
    CollapseModule,
    ReactiveFormsModule,
    SharedModule
  ],
  exports: [
    TranslateModule,
  ],
  providers: [
    ThemeService,
    WindowService,
    BackendService,
    KsiTitleService,
    BsModalService,
    YearsService,
    VersionService,
    AchievementService
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}
