import { Injectable } from '@angular/core';
import { BackendService, YearsService } from '../shared';
import { map, switchMap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { User, Year, YearCreationRequest, YearResponse, YearUpdateRequest } from 'src/api/backend';

@Injectable({
  providedIn: 'root'
})
export class AdminYearsService {

  constructor(
    private backend: BackendService,
  ) { }

  public getYears(): Observable<Year[]> {
    return this.backend.http.yearsGetAll().pipe(
      map(response => response.years)
    );
  }

  public getYearById(yearId: number): Observable<Year | undefined> {
    return this.backend.http.yearsGetSingle(yearId).pipe(
      map(response => response ? response.year : undefined)
    );
  }

  public createYear(year: YearCreationRequest): Observable<Year> {
    return this.backend.http.yearsCreateNew(year).pipe(
      map(response => response.year)
    );
  }

  public updateYear(year: YearUpdateRequest, yearId: number): Observable<Year> {
    return this.backend.http.yearsUpdateSingle(year, yearId).pipe(
      map(response => response.year)
    );
  }

  public deleteYear(yearId: number): Observable<void> {
    return this.backend.http.yearsDeleteSingle(yearId).pipe(
      map(() => undefined)
    );
  }

  public getAllOrganisators(): Observable<User[]> {
    return this.backend.http.usersGetAll('organisators').pipe(
      map(response => response.users)
    );
  }

}
