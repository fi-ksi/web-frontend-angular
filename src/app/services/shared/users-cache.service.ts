import { Injectable } from '@angular/core';
import { BackendService } from './backend.service';
import { Observable, of } from 'rxjs';
import { User } from '../../../api';
import { map, mergeMap } from 'rxjs/operators';
import { Utils, Cache } from '../../util';
import { environment } from '../../../environments/environment';
import { IUser, YearSelect } from '../../models';
import { YearsService } from './years.service';
import { UserService } from './user.service';

@Injectable({
  providedIn: 'root'
})
export class UsersCacheService {
  /**
   * Do not use the cache directly for getting the user, rather use
   * the getUser function. The cache can have values for another year stored (the method takes care of that)
   */
  readonly cache = new Cache<number, IUser>(
    1000,
    (userId) => this.backend.http.usersGetSingle(userId, this.year.selected?.id).pipe(map((resp) => this.getIUser(resp.user)))
  );

  constructor(private backend: BackendService, private year: YearsService, private userService: UserService) {
    // flush cache on login change
    this.userService.isLoggedIn$
      .subscribe(() => this.cache.flush());
  }

  getUser(userId: number): Observable<IUser> {
    return this.cache.get(userId).pipe(mergeMap((user) => {
      if (user.$year?.id === this.year.selected?.id) {
        return of(user);
      }
      return this.cache.refresh(user.id);
    }));
  }

  public getIUser(user: User, year?: YearSelect | null): IUser {
    const isAdmin = user.role === 'admin';
    const isOrg = isAdmin || user.role === 'org';
    const fullName = `${user.first_name}${user.nick_name ? ' "' + user.nick_name + '"' : ''} ${user.last_name}`;

    return {
      ...user,
      $isAdmin: isAdmin,
      $isOrg: isOrg,
      $year: typeof year !== 'undefined' ? year : this.year.selected,
      $fullName: fullName,
      $hasPicture: !!user.profile_picture,
      profile_picture: UsersCacheService.getProfilePicture(user, isOrg)
    };
  }

  public static getProfilePicture(user: Pick<User, 'profile_picture' | 'gender'>, isOrg: boolean): string {
    if (user.profile_picture) {
      return Utils.fixUrl(`${environment.backend}${user.profile_picture}`);
    }
    return `assets/img/avatar/${isOrg ? 'org' : 'default'}${user.gender === 'male' ? '' : '-woman'}.svg`;
  }
}
