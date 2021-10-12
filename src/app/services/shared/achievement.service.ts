import { Injectable } from '@angular/core';
import { BackendService } from "./backend.service";
import { Achievement } from "../../../api";
import { Observable, of } from "rxjs";
import { map, tap } from "rxjs/operators";

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
        this.cache[id] = achievement;
      })
    );
  }
}
