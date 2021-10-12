import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { AchievementService, BackendService, ThemeService, VersionService, YearsService } from './services';
import { WindowService } from './services';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { KsiTitleService } from "./services";
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { BsModalService } from "ngx-bootstrap/modal";
import { RootModule } from "./components/root/root.module";

export function HttpLoaderFactory(http: HttpClient): TranslateHttpLoader {
  return new TranslateHttpLoader(http);
}

@NgModule({
  declarations: [
    AppComponent,
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
    RootModule
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
