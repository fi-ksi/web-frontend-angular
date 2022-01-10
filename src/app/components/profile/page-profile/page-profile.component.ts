import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { IconService, KsiTitleService, UsersCacheService, WindowService, YearsService } from "../../../services";
import { ActivatedRoute } from "@angular/router";
import { combineLatest, Observable } from "rxjs";
import { map, mergeMap, shareReplay, tap } from "rxjs/operators";
import { UserService } from "../../../services/shared/user.service";
import { IUser } from "../../../models";
import { BarValue } from "ngx-bootstrap/progressbar/progressbar-type.interface";

@Component({
  selector: 'ksi-page-profile',
  templateUrl: './page-profile.component.html',
  styleUrls: ['./page-profile.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PageProfileComponent implements OnInit {
  user$: Observable<IUser>;

  userSeasonsString$: Observable<string>;

  userProgress$: Observable<BarValue[]>;

  constructor(
    public userService: UserService,
    private users: UsersCacheService,
    private route: ActivatedRoute,
    private title: KsiTitleService,
    public years: YearsService,
    public window: WindowService,
    public icon: IconService
  ) { }

  ngOnInit(): void {
    this.user$ = combineLatest([this.route.params, this.years.selected$, this.userService.isLoggedIn$]).pipe(
      map(([params, year]) => ({userId: Number(params.id), year})),
      mergeMap(({userId, year}) => this.users.getUser(userId, year)),
      tap((user) => this.title.subtitle = user.first_name),
      shareReplay(1)
    );

    this.userSeasonsString$ = this.user$.pipe(
      map((user) => user.seasons ? user.seasons.map((x) => `${x}.`).join(', ') : '')
    );

    this.userProgress$ = combineLatest([this.years.selectedFull$, this.user$]).pipe(
      map(([year, user]) => {
        const currentUserPercentage = 100 * user.score / year!.sum_points;
        const requiredPercentage = (0.6 * year!.sum_points) - currentUserPercentage;
        const currentUserPercentageFloored = Math.floor(currentUserPercentage);

        return [
          {
            type: user.successful ? 'success' : 'warning',
            value: currentUserPercentage,
            max: year!.sum_points,
            label: user.successful ? `${currentUserPercentageFloored}%` : ''
          },
          {
            type: 'info',
            value: requiredPercentage,
            max: year!.sum_points,
            label: !user.successful ? `${currentUserPercentageFloored}%` : ''
          }
        ]
      })
    );
  }
}
