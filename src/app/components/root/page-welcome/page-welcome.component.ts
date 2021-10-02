import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { BackendService, KsiTitleService, YearsService } from "../../../services";
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

  constructor(private title: KsiTitleService, private years: YearsService, private backend: BackendService) {}

  ngOnInit(): void {
    this.title.subtitle = null;
    this.articles$ = this.years.selected$.pipe(switchMap((year) => {
      return this.backend.http.articlesGetAll(5, 0, undefined, year?.id || undefined)
        .pipe(map((response) => response.articles.map((article) => ({
          ...article,
          picture: PageWelcomeComponent.parseLegacyAssetsUrl(article.picture),
          body: PageWelcomeComponent.substrHTML(article.body, 0, 512)
        }))));
    }));
    this.organisators$ = this.years.selected$.pipe(switchMap((year) => {
      return this.backend.http.usersGetAll('organisators', 'score', year?.id || undefined).pipe(map((response) => response.users));
    }));
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
}
