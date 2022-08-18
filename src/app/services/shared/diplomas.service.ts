import { Injectable } from '@angular/core';
import { BackendService } from './backend.service';
import { Cache } from '../../util';
import { DiplomasList, User } from '../../../api';
import { map } from 'rxjs/operators';
import { YearsService } from './years.service';
import { combineLatest, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DiplomasService {
  readonly cache = new Cache<number, DiplomasList[]>(
    1000,
    (userId) => this.backend.http.diplomasListForUserSingle(userId).pipe(map((r) => r.diplomas))
  );

  constructor(private backend: BackendService, private years: YearsService) { }

  userHasDiploma(user: User): Observable<boolean> {
    return combineLatest([this.cache.get(user.id), this.years.selected$]).pipe(
      map(
        ([diplomas, year]) => diplomas.find((diploma) => diploma.year === year?.id) !== undefined
      )
    );
  }

  userDiplomaURL(user: User): Observable<string | undefined> {
    return combineLatest([this.cache.get(user.id), this.years.selected$]).pipe(
      map(
        ([diplomas, year]) => diplomas.find((diploma) => diploma.year === year?.id)?.url
      )
    );
  }

  uploadDiploma(user: User, file: File): void {
    this.backend.http.adminDiplomaGrantForm(file, user.id, this.years.selected?.id).subscribe(() => {
      environment.logger.debug(`[DIPLOMA] Successfully granted to ${user.id}, refreshing diploma cache`);
      this.cache.refresh(user.id).subscribe();
    });
  }
}
