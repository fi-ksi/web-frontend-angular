import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import {
  BackendService,
  IconService,
  KsiTitleService,
  UsersCacheService,
  WindowService,
  YearsService,
  UserService, TasksService
} from "../../../services";
import { ActivatedRoute, Router } from "@angular/router";
import { combineLatest, Observable, of } from "rxjs";
import { map, mergeMap, shareReplay, tap } from "rxjs/operators";
import { IUser } from "../../../models";
import { BarValue } from "ngx-bootstrap/progressbar/progressbar-type.interface";
import { ROUTES } from "../../../../routes/routes";
import { ProfileResponse } from "../../../../api";

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

  tasksWithScore$: Observable<{id: number, score?: number}[]>;

  constructor(
    public userService: UserService,
    private backend: BackendService,
    private users: UsersCacheService,
    private route: ActivatedRoute,
    private router: Router,
    private title: KsiTitleService,
    public years: YearsService,
    public window: WindowService,
    public icon: IconService,
    private tasks: TasksService
  ) {
  }

  ngOnInit(): void {
    this.user$ = combineLatest([this.route.params, this.years.selected$, this.userService.isLoggedIn$]).pipe(
      map(([params, year]) => ({userId: Number(params.id), year})),
      mergeMap(({userId, year}) => {
        if (userId && !isNaN(userId)) {
          return of({userId, year});
        } else {
          return this.userService.forceLogin$.pipe(
            mergeMap(() => this.backend.user$),
            tap((loggedUser) => this.router.navigate(['/', ROUTES.profile._, `${loggedUser!.id}`])),
            map((loggedUser) => ({userId: loggedUser!.id, year}))
          );
        }
      }),
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
        const requiredPercentage = Math.max(0, 60 - currentUserPercentage);
        const currentUserPercentageFloored = Math.floor(currentUserPercentage);

        return [
          {
            type: user.successful ? 'success' : 'warning',
            value: currentUserPercentage,
            max: 100,
            label: currentUserPercentage >= 50 ? `${currentUserPercentageFloored}%` : ''
          },
          {
            type: 'info',
            value: requiredPercentage,
            max: 100,
            label: currentUserPercentage < 50 ? `${currentUserPercentageFloored}%` : ''
          }
        ]
      })
    );

    const profile$: Observable<ProfileResponse | null> = combineLatest([this.years.selectedFull$, this.user$, this.backend.user$, this.userService.isOrg$]).pipe(
      mergeMap(([year, selectedUser, loggedInUser, isOrg]) => {
        if (selectedUser.id !== loggedInUser?.id && !isOrg) {
          return of(null);
        }
        return isOrg ? this.backend.http.profileGetSingle(selectedUser.id, year?.id) : this.backend.http.profileGetMy(year?.id);
      }),
      tap((profile) => {
        if (profile) {
          profile.tasks.forEach((task) => this.tasks.updateTask(task))
        }
      }),
      shareReplay(1)
    );

    this.tasksWithScore$ = combineLatest([this.user$, profile$]).pipe(
      map(([user, profile]) => {
        if (user.$isOrg) {
          return user.tasks!.map((taskId) => ({id: taskId}));
        }
        if (!profile) {
          return [];
        }
        return profile.taskScores.map((score) => ({id: score.task, score: score.score}));
      })
    );
  }
}
