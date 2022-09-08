import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, Subject } from 'rxjs';
import { YearSelect, IYear, IUser } from '../../models';
import { AdminTask, Article, Thread, User } from '../../../api';
import { map, mergeMap, shareReplay, switchMap, take, tap } from 'rxjs/operators';
import { BackendService } from './backend.service';
import { Cache, Utils } from '../../util';
import { StorageService } from './storage.service';
import { UsersCacheService } from './users-cache.service';

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
  readonly selectedFull$: Observable<IYear | null>;

  readonly all$: Observable<IYear[]>;

  readonly articles$: Observable<Article[]>;
  readonly organisators$: Observable<(User & Pick<IUser, '$hasPicture'>)[]>;
  /**
   * Observable of high school users, sorted by score
   */
  readonly usersHighSchool$: Observable<User[]>;
  /**
   * Observable of non-high school users, sorted by score
   */
  readonly usersOther$: Observable<User[]>;

  readonly discussionThreads$: Observable<Thread[]>;

  readonly adminTasks$: Observable<AdminTask[]>;

  private selectedSubject: Subject<YearSelect | null>;
  private _selected: YearSelect | null;
  private readonly storage = this.storageRoot.open('years');
  private fullYearCache = new Cache<number, IYear>(
    1000,
    (yearId) => this.all$.pipe(
      take(1),
      map((years) => years.find((year) => year.id === yearId)),
      map((year) => {
        if (year !== undefined) {
          return year;
        }
        throw new Error('unknown year');
      })
    )
  );

  constructor(private backend: BackendService, private storageRoot: StorageService) {
    const savedYearValue: YearSelect | null = this.storage.get<YearSelect>('selected');
    this.selectedSubject = new BehaviorSubject(savedYearValue);
    this._selected = savedYearValue;

    this.selected$ = this.selectedSubject.asObservable();
    this.selectedFull$ = this.selected$.pipe(
      switchMap((select) => select ? this.fullYearCache.get(select.id) : of(null))
    );

    this.all$ = this.backend.http.yearsGetAll().pipe(
      // sort years by index DESC
      map((resp) => resp.years.sort((a, b) => b.id - a.id)),
      map((years) => years.map((year, index) => ({...year, $newest: index === 0}))),
      tap((years) => {
        years.forEach((year) => this.fullYearCache.set(year.id, year));

        // refresh the selected year with the newest value (e.g. when a point-pad changes)
        if (this.selected) {
          this.selected = years.find((year) => this.selected?.id === year.id) || null;
        }

        // if no year is selected, select the one with the highest index
        if (years && !this.selected) {
          this.selected = years[0];
        }
      }),
      shareReplay(1),
    );

    this.articles$ = this.selected$.pipe(switchMap((year) => {
      return this.backend.http.articlesGetAll(30, 0, undefined, year?.id || undefined)
        .pipe(
          map((response) => response.articles.map((article) => ({
            ...article,
            picture: Utils.parseLegacyAssetsUrl(article.picture),
            body: Utils.substrHTML(article.body, 0, 512)
          }))),
        );
    }));

    this.organisators$ = this.selected$.pipe(
      mergeMap((year) =>
        this.backend.http.usersGetAll('organisators', 'score', year?.id || undefined)
      ), map((response) => response.users.map((user) => ({
        ...user,
        $hasPicture: !!user.profile_picture,
        profile_picture: UsersCacheService.getProfilePicture(user, true)
      })).sort((a, b) => {
        if (a.$hasPicture && !b.$hasPicture) {
          return -1;
        }
        if (!a.$hasPicture && b.$hasPicture) {
          return 1;
        }

        const now = new Date();

        const dayA = a.id % now.getDay();
        const dayB = a.id % now.getDay();

        if (dayA !== dayB) {
          return dayA < dayB ? -1 :1;
        }

        const reverse = now.getDate() % 2 == 1;

        if (a.id > b.id) {
          return reverse ? -1 : 1;
        } else {
          return reverse ? 1 : -1;
        }
      }))
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

    this.adminTasks$ = this.selected$.pipe(
      mergeMap(
        (year) => this.backend.http.adminTasksGetAll(undefined, year?.id)
      ),
      map((response) => response.atasks)
    );

    // auto select new year when published
    this.all$.pipe(take(1)).subscribe((years) => {
      if (savedYearValue && savedYearValue.$newest && years[0].id !== savedYearValue.id) {
        this.selected = years[0];
      }
    });
  }

  public getById(yearId: number): Observable<YearSelect | undefined> {
    return this.all$.pipe(
      tap((x) => console.log('years', x, x.find((year) => year.id === yearId))),
      map((years) => years.find((year) => year.id === yearId))
    );
  }
}
