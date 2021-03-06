import { Injectable } from '@angular/core';
import { BackendService } from "./backend.service";
import { Achievement } from "../../../api";
import { Observable, of } from "rxjs";
import { map, tap } from "rxjs/operators";
import { YearsService } from "./years.service";

@Injectable({
  providedIn: 'root'
})
export class AchievementService {
  private cache: {[achievementId: number]: Achievement} = {};

  constructor(private backend: BackendService, private year: YearsService) {
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

  getAll(yearId?: number): Observable<Achievement[]> {
    yearId = typeof yearId === "undefined" ? this.year.selected?.id : yearId;
    return this.backend.http.achievementsGetAll(20, 0, undefined, yearId).pipe(
      map((response) => response.achievements),
      tap((achievements) => achievements.forEach((achievement) => {
        this.cache[achievement.id] = achievement;
      }))
    )
  }
}
