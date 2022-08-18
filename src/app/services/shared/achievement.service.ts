import { Injectable } from '@angular/core';
import { BackendService } from './backend.service';
import { Achievement } from '../../../api';
import { Observable } from 'rxjs';
import { map, mergeMap, tap } from 'rxjs/operators';
import { YearsService } from './years.service';
import { Cache } from 'src/app/util';

type SpecialAchievementName = 'successful';

@Injectable({
  providedIn: 'root'
})
export class AchievementService {
  readonly cache = new Cache<number, Achievement>(
    1000,
    (achievementId) => this.backend.http.achievementsGetSingle(achievementId).pipe(map((r) => r.achievement))
  );

  private readonly specialCacheIds = new Cache<SpecialAchievementName, number>(
    100,
    (name) => {
      switch (name) {
      case 'successful':
        return this.backend.http.achievementsGetSuccessful().pipe(map((r) => r.achievement.id));
      default:
        throw new Error('Unknown special achievement');
      }
    }
  );

  constructor(private backend: BackendService, private year: YearsService) {
  }

  getAchievement(id: number): Observable<Achievement> {
    return this.cache.get(id);
  }

  getSpecialAchievement(name: SpecialAchievementName): Observable<Achievement> {
    return this.specialCacheIds.get(name).pipe(mergeMap((achievementId) => this.getAchievement(achievementId)));
  }

  getAll(yearId?: number): Observable<Achievement[]> {
    yearId = typeof yearId === 'undefined' ? this.year.selected?.id : yearId;
    return this.backend.http.achievementsGetAll(20, 0, undefined, yearId).pipe(
      map((response) => response.achievements),
      tap((achievements) => achievements.forEach((achievement) => {
        this.cache.set(achievement.id, achievement);
      }))
    );
  }
}
