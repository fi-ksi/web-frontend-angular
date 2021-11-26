import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, Subject } from "rxjs";
import { YearSelect } from "../../models";
import { Article, Thread, User, Year } from "../../../api";
import { map, mergeMap, shareReplay, switchMap, tap } from "rxjs/operators";
import { BackendService } from "./backend.service";
import { Utils } from "../../util";
import { StorageService } from "./storage.service";
import { UsersCacheService } from "./users-cache.service";

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
      this.storage.set('selected', value);
    } else {
      this.storage.delete('selected');
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

  readonly discussionThreads$: Observable<Thread[]>;

  private selectedSubject: Subject<YearSelect | null>;
  private _selected: YearSelect | null;
  private readonly storage = this.storageRoot.open('years');
  private fullYearCache: {[id: number]: Year} = {};

  constructor(private backend: BackendService, private storageRoot: StorageService) {
    const savedYearValue: YearSelect | null = this.storage.get<YearSelect>('selected');
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
        profile_picture: UsersCacheService.getOrgProfilePicture(user)
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

    this.discussionThreads$ = this.selected$.pipe(
      mergeMap(
        (year) => this.backend.http.threadsGetAll(undefined, year?.id)
      ),
      map((response) => response.threads)
    );
  }
}
