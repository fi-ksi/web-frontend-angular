import { Injectable } from '@angular/core';
import { BackendService } from "./backend.service";
import { Observable, of } from "rxjs";
import { User } from "../../../api";
import { map, shareReplay, tap } from "rxjs/operators";
import { Utils } from "../../util";
import { environment } from "../../../environments/environment";
import { IUser, YearSelect } from "../../models";
import { YearsService } from "./years.service";
import { UserService } from "./user.service";

@Injectable({
  providedIn: 'root'
})
export class UsersCacheService {
  private readonly cache: {[userId: number]: IUser} = {};

  private static readonly CACHE_SIZE = 100;

  constructor(private backend: BackendService, private year: YearsService, private userService: UserService) {
    // flush cache on login change
    this.userService.isLoggedIn$
      .subscribe(() => Object.keys(this.cache).forEach((key) => delete this.cache[Number(key)]));
  }

  getUser(userId: number, year?: YearSelect | null): Observable<IUser> {
    if (typeof year === "undefined") {
      year = this.year.selected;
    }

    if (userId in this.cache && this.cache[userId].$year === year) {
      return of(this.cache[userId]);
    }

    return this.backend.http.usersGetSingle(userId, year?.id).pipe(
      map((response) =>
        ({...response.user, profile_picture: UsersCacheService.getOrgProfilePicture(response.user)})
      ),
      map((user) => this.getIUser(user)),
      tap((user) => {
        const cachedKeys = Object.keys(this.cache);
        let firstKey;
        while (cachedKeys.length >= UsersCacheService.CACHE_SIZE && (firstKey = cachedKeys.shift())) {
          delete this.cache[Number(firstKey)];
        }

        this.cache[userId] = user;
      }),
      shareReplay(1)
    );
  }

  private getIUser(user: User, year?: YearSelect | null): IUser {
    const isAdmin = user.role === "admin";
    const isOrg = isAdmin || user.role === "org";
    const fullName = `${user.first_name}${user.nick_name ? ' "' + user.nick_name + '"' : ''} ${user.last_name}`;

    return {
      ...user,
      achievements: [...user.achievements, ...user.achievements, ...user.achievements], // TODO remove achievements duplications
      $isAdmin: isAdmin,
      $isOrg: isOrg,
      $year: typeof year !== "undefined" ? year : this.year.selected,
      $fullName: fullName
    };
  }

  public static getOrgProfilePicture(organisator: User): string {
    // TODO get picture for all users
    if (organisator.profile_picture) {
      return Utils.fixUrl(`${environment.backend}${organisator.profile_picture}`);
    }
    if (organisator.gender === 'male') {
      return 'assets/img/avatar/org.svg';
    }
    return 'assets/img/avatar/org-woman.svg';
  }
}
