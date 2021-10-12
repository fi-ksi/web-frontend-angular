import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, Subject } from "rxjs";
import { YearSelect } from "../../models";
import { Article, User, Year } from "../../../api";
import { map, mergeMap, shareReplay, switchMap, tap } from "rxjs/operators";
import { BackendService } from "./backend.service";
import { Utils } from "../../util";

@Injectable({
  providedIn: 'root'
})
export class YearsService {
  get selected(): YearSelect | null {
    return this._selected;
  }

  set selected(value: YearSelect | null) {
    this._selected = value;
    this.selectedSubject.next(value);

    if (value) {
      localStorage.setItem(YearsService.STORAGE_SELECTED_KEY, JSON.stringify(value));
    } else {
      localStorage.removeItem(YearsService.STORAGE_SELECTED_KEY);
    }
  }

  readonly selected$: Observable<YearSelect | null>;
  readonly selectedFull$: Observable<Year | null>;

  readonly all$: Observable<Year[]>;

  readonly articles$: Observable<Article[]>;
  readonly organisators$: Observable<User[]>;
  /**
   * Observable of high school users, sorted by score
   */
  readonly usersHighSchool$: Observable<User[]>;
  /**
   * Observable of non high school users, sorted by score
   */
  readonly usersOther$: Observable<User[]>;

  private selectedSubject: Subject<YearSelect | null>;
  private _selected: YearSelect | null;
  private static readonly STORAGE_SELECTED_KEY = 'years/selected';
  private fullYearCache: {[id: number]: Year} = {};

  constructor(private backend: BackendService) {
    const savedYearString = localStorage.getItem(YearsService.STORAGE_SELECTED_KEY);
    const savedYearValue: YearSelect | null = savedYearString ? JSON.parse(savedYearString) : null;
    this.selectedSubject = new BehaviorSubject(savedYearValue);
    this._selected = savedYearValue;

    this.selected$ = this.selectedSubject.asObservable();
    this.selectedFull$ = this.selected$.pipe(switchMap((select) => {
      if (!select) {
        return of(null);
      }
      if (select.id in this.fullYearCache) {
        return of(this.fullYearCache[select.id]);
      }
      return this.backend.http.yearsGetSingle(select.id).pipe(
        map((response) => response.year),
        tap((year) => {
          this.fullYearCache[select.id] = year;
        })
      );
    }));

    this.all$ = this.backend.http.yearsGetAll().pipe(
      shareReplay(1),
      // sort years by index DESC
      map((resp) => resp.years.sort((a, b) => b.id - a.id)),
      tap((years) => {
        // if no year is selected, select the one with the highest index
        if (years && !this.selected) {
          this.selected = years[0];
        }
      })
    );

    this.articles$ = this.selected$.pipe(switchMap((year) => {
      // TODO allow more than 6 articles
      return this.backend.http.articlesGetAll(6, 0, undefined, year?.id || undefined)
        .pipe(
          map((response) => response.articles.map((article) => ({
            ...article,
            picture: Utils.parseLegacyAssetsUrl(article.picture),
            body: Utils.substrHTML(article.body, 0, 512)
          }))),
          // TODO remove artificial quadruplication
          map((articles) => [...articles, ...articles, ...articles, ...articles])
        );
    }));

    this.organisators$ = this.selected$.pipe(
      mergeMap((year) =>
        this.backend.http.usersGetAll('organisators', 'score', year?.id || undefined)
      ), map((response) => response.users.map((user) => ({
        ...user,
        profile_picture: Utils.getOrgProfilePicture(user)
      })))
    );

    this.usersHighSchool$ = this.selected$.pipe(
      mergeMap((year) => {
        return this.backend.http.usersGetAll('part-hs', 'score', year?.id || undefined);
      }),
      map((response) => response.users)
    );

    this.usersOther$ = this.selected$.pipe(
      mergeMap((year) => {
        return this.backend.http.usersGetAll('part-other', 'score', year?.id || undefined);
      }),
      map((response) => response.users)
    );
  }
}
