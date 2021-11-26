import { Injectable } from '@angular/core';
import { BackendService } from "./backend.service";
import { Observable } from "rxjs";
import { User } from "../../../api";
import { map, shareReplay } from "rxjs/operators";
import { Utils } from "../../util";
import { environment } from "../../../environments/environment";

@Injectable({
  providedIn: 'root'
})
export class UsersCacheService {
  private readonly cache: {[userId: number]: Observable<User>} = {};
  private readonly cacheIds: number[] = [];

  private static readonly CACHE_SIZE = 100;

  constructor(private backend: BackendService) { }

  getUser(userId: number): Observable<User> {
    if (!(userId in this.cache)) {
      const r = this.cache[userId] = this.backend.http.usersGetSingle(userId).pipe(
        map((response) =>
          ({...response.user, profile_picture: UsersCacheService.getOrgProfilePicture(response.user)})
        ),
        shareReplay(1)
      );
      this.cacheIds.push(userId);
      if (this.cacheIds && this.cacheIds.length > UsersCacheService.CACHE_SIZE) {
        delete this.cache[this.cacheIds.shift()!];
      }
      return r;

    } else {
      return this.cache[userId];
    }
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
