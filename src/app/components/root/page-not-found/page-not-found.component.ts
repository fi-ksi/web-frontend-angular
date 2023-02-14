import { Component, OnInit, ChangeDetectionStrategy, OnDestroy } from '@angular/core';
import { KsiTitleService } from '../../../services';
import { ActivatedRoute } from '@angular/router';
import { Observable, of, Subscription } from 'rxjs';
import { UserService } from '../../../services/shared/user.service';
import { filter, mergeMap, take, tap } from 'rxjs/operators';

@Component({
  selector: 'ksi-page-not-found',
  templateUrl: './page-not-found.component.html',
  styleUrls: ['./page-not-found.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PageNotFoundComponent implements OnInit, OnDestroy {
  path$: Observable<string | null>;
  host$: Observable<string>;

  loggedIn$: Observable<boolean>;

  private readonly _subs: Subscription[] = [];

  constructor(private title: KsiTitleService, private route: ActivatedRoute, private user: UserService) { }

  ngOnInit(): void {
    this.host$ = of(`${location.protocol}//${location.host}`);
    this.path$ = this.route.fragment;
    this.loggedIn$ = this.user.isLoggedIn$.pipe(take(1), tap((isLoggedIn) => {
      if (!isLoggedIn) {
        // refresh page after login
        this._subs.push(this.user.isLoggedIn$.pipe(
          filter((x) => x),
          mergeMap(() => this.path$),
          take(1),
        ).subscribe(
          (path) => {
            if (path === null) {
              location.reload();
            } else {
              location.href = path;
            }
          }
        ));
      }
    }));

    this.title.subtitle = 'root.not-found.title';
  }

  ngOnDestroy(): void {
    this._subs.forEach((s) => s.unsubscribe());
  }
}
