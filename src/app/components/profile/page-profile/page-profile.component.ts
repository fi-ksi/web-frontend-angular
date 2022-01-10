import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { KsiTitleService, UsersCacheService } from "../../../services";
import { ActivatedRoute } from "@angular/router";
import { Observable } from "rxjs";
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
    private title: KsiTitleService
  ) { }

  ngOnInit(): void {
    this.user$ = this.route.params.pipe(
      map((params) => Number(params.id)),
      mergeMap((userId) => this.users.getUser(userId)),
      tap((user) => this.title.subtitle = user.first_name),
      shareReplay(1)
    );
  }
}
