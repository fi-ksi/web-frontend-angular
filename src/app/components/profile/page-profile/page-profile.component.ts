import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { KsiTitleService, UsersCacheService, YearsService } from "../../../services";
import { ActivatedRoute } from "@angular/router";
import { combineLatest, Observable } from "rxjs";
import { map, mergeMap, shareReplay, tap } from "rxjs/operators";
import { UserService } from "../../../services/shared/user.service";
import { IUser } from "../../../models";

@Component({
  selector: 'ksi-page-profile',
  templateUrl: './page-profile.component.html',
  styleUrls: ['./page-profile.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PageProfileComponent implements OnInit {
  user$: Observable<IUser>;

  constructor(
    public userService: UserService,
    private users: UsersCacheService,
    private route: ActivatedRoute,
    private title: KsiTitleService,
    private years: YearsService,
  ) { }

  ngOnInit(): void {
    this.user$ = combineLatest([this.route.params, this.years.selected$]).pipe(
      map(([params, year]) => ({userId: Number(params.id), year})),
      mergeMap(({userId, year}) => this.users.getUser(userId, year)),
      tap((user) => this.title.subtitle = user.first_name),
      shareReplay(1)
    );
  }
}
