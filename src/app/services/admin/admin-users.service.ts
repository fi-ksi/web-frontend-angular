import { Injectable } from '@angular/core';
import { BackendService } from '../shared';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AdminUsersService {

  constructor(
        private backend: BackendService,
  ) { }

    public getUsers(): Observable<any[]> {
      return this.backend.http.usersGetAll().pipe(
          map(response => response.users)
      );
    }


    public deleteUser(userId: number): Observable<void> {
      return this.backend.http.usersDeleteSingle(userId).pipe(
          map(() => {})
      );
    } 
  
}
