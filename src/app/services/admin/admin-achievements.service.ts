import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { BackendService } from '../shared';
import { AchievementGrantRequest, AchievementGrantResponse, InlineResponse2001 } from 'src/api/backend';

@Injectable({
  providedIn: 'root'
})
export class AdminAchievementsService {

  constructor(
    private backend: BackendService,
  ) { }


  public getAchievements(): Observable<any[]> {
    return this.backend.http.achievementsGetAll().pipe(
      map(response => response.achievements)
    );
  }

  public createAchievement(achievement: any): Observable<any> {
    console.log("Creating achievement:", achievement);
    return this.backend.http.achievementsCreateNew(achievement).pipe(
      map(response => response.achievement)
    );
  }

  public updateAchievement(achievement: any, achievementId: number): Observable<any> {
    return this.backend.http.achievementsEditSingle(achievement, achievementId).pipe(
      map(response => response.achievement)
    );
  }

  public getAchievementById(achievementId: number): Observable<any> {
    return this.backend.http.achievementsGetSingle(achievementId).pipe(
      map(response => response.achievement)
    );
  }

  public deleteAchievement(achievementId: number): Observable<void> {
    return this.backend.http.achievementsDeleteSingle(achievementId).pipe(
      map(() => undefined)
    );
  }


  public getAllAchievementImages(): Observable<InlineResponse2001> {
    return this.backend.http.contentsGetSingle(`achievements`).pipe(
      map(response => response)
    );
  }

  public deleteAchievementImage(imageName: string): Observable<void> {
    return this.backend.http.contentsDeleteSingle(`achievements/${imageName}`).pipe(
      map(() => undefined)
    );
  }

  public uploadAchievementImage(files: Array<Blob>): Observable<void> {
    return this.backend.http.contentsCreateNewForm(files, `achievements`).pipe(
      map(() => undefined)
    );
  }

  grantAchievement(AchievementGrantRequest: AchievementGrantRequest): Observable<AchievementGrantResponse> {
    return this.backend.http.adminAchievementsGrant(AchievementGrantRequest).pipe(map(response => response));
  }

}