import { Injectable } from '@angular/core';
import { BackendService } from "./backend.service";
import { Achievement } from "../../../api";
import { Observable, of } from "rxjs";
import { map, tap } from "rxjs/operators";
import { environment } from "../../../environments/environment";

@Injectable({
  providedIn: 'root'
})
export class AchievementService {
  private cache: {[achievementId: number]: Achievement} = {};

  constructor(private backend: BackendService) {
  }

  getAchievement(id: number): Observable<Achievement> {
    if (id in this.cache) {
      return of(this.cache[id]);
    }
    return this.backend.http.achievementsGetSingle(id).pipe(
      map((response) => response.achievement),
      tap((achievement) => {
        achievement.picture = `${environment.backend}taskContent/10/icon/base.svg`; // TODO remove fixed URL
        this.cache[id] = achievement;
      })
    );
  }
}
