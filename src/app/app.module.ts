import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NavbarComponent } from './components/root/navbar/navbar.component';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { FooterComponent } from './components/root/footer/footer.component';
import { BackendService, ThemeService } from './services';
import { WindowService } from './services';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { KsiTitleService } from "./services";
import { PageWelcomeComponent } from './components/root/page-welcome/page-welcome.component';
import { PageNotFoundComponent } from './components/root/page-not-found/page-not-found.component';
import { ArticlePreviewComponent } from './components/root/article-preview/article-preview.component';

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
    ArticlePreviewComponent
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
    NgbModule
  ],
  exports: [
    TranslateModule
  ],
  providers: [
    ThemeService,
    WindowService,
    BackendService,
    KsiTitleService
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}
