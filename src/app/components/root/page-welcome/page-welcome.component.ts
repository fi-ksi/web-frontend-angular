import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, ElementRef } from '@angular/core';
import { BackendService, KsiTitleService, WindowService, YearsService } from "../../../services";
import { Observable } from "rxjs";
import { Article, User } from "../../../../api";
import { map, switchMap } from "rxjs/operators";

@Component({
  selector: 'ksi-page-welcome',
  templateUrl: './page-welcome.component.html',
  styleUrls: ['./page-welcome.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PageWelcomeComponent implements OnInit {

  articles$: Observable<Article[]>;
  organisators$: Observable<User[]>;

  aboutInfoSlide = 0;
  aboutInfoShown = false;

  constructor(
    private title: KsiTitleService,
    private years: YearsService,
    private backend: BackendService,
    private cd: ChangeDetectorRef,
    private elRef: ElementRef
  ) {
  }

  ngOnInit(): void {
    this.title.subtitle = null;
    this.articles$ = this.years.selected$.pipe(switchMap((year) => {
      return this.backend.http.articlesGetAll(6, 0, undefined, year?.id || undefined)
        .pipe(
          map((response) => response.articles.map((article) => ({
            ...article,
            picture: PageWelcomeComponent.parseLegacyAssetsUrl(article.picture),
            body: PageWelcomeComponent.substrHTML(article.body, 0, 512)
          }))),
          // TODO remove artificial quadruplication
          map((articles) => [...articles, ...articles, ...articles, ...articles])
        );
    }));
    this.organisators$ = this.years.selected$.pipe(switchMap((year) => {
      return this.backend.http.usersGetAll('organisators', 'score', year?.id || undefined)
        .pipe(map((response) => response.users.map((user) => ({
          ...user,
          profile_picture: PageWelcomeComponent.getOrgProfilePicture(user)
        }))));
    }));
  }

  toggleAboutInfo(slide: number): void {
    if (this.aboutInfoShown && this.aboutInfoSlide === slide) {
      this.aboutInfoShown = false;
      this.cd.markForCheck();
      return;
    }

    this.aboutInfoShown = true;
    this.aboutInfoSlide = slide;
    this.cd.detectChanges();

    setTimeout(() => {
      const carousel = ((this.elRef.nativeElement as HTMLElement).querySelector('.about-carousel') as HTMLElement | null);
      if (!carousel) {
        return;
      }
      if (!WindowService.isElementVisible(carousel, 50)) {
        carousel.scrollIntoView({behavior: "smooth", block: "start", inline: "nearest"});
      }
    });
  }

  onAboutSlideChange(slide: number): void {
    if (!this.aboutInfoShown || this.aboutInfoSlide === slide) {
      return;
    }
    this.aboutInfoSlide = slide;
    this.cd.markForCheck();
  }

  /**
   * Creates a substring of a HTML by putting it into a div element and then substringing .innerText
   * @param html html to substring
   * @param start where to start
   * @param length how many characters to keep
   * @private
   */
  private static substrHTML(html: string, start: number, length?: number): string {
    const div = document.createElement('div');
    div.innerHTML = html;
    return div.innerText.substr(start, length);
  }

  /**
   * Resolves legacy address into new assets format
   * @param url possilby legacy url
   * @private
   */
  private static parseLegacyAssetsUrl(url: string): string {
    return url.startsWith('img/') ? `assets/${url}` : url;
  }

  private static getOrgProfilePicture(organisator: User): string {
    if (organisator.profile_picture) {
      return organisator.profile_picture;
    }
    if (organisator.gender === 'male') {
      return 'assets/img/avatar/org.svg';
    }
    return 'assets/img/avatar/org-woman.svg';
  }

  openKScuk(): void {
    location.href = "https://kscuk.fi.muni.cz/"
  }
}
