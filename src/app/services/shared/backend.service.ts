import { Injectable } from '@angular/core';
import { Configuration, DefaultService } from '../../../api';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { environment } from "../../../environments/environment";
import { Observable, of } from "rxjs";
import { catchError, mapTo } from "rxjs/operators";

@Injectable({
  providedIn: 'root'
})
export class BackendService {
  private readonly _http: DefaultService;

  get http(): DefaultService {
    return this._http;
  }

  constructor(private httpClient: HttpClient) {
    this._http = new DefaultService(this.httpClient, environment.backend, new Configuration());
  }

  /**
   * Tries to login with given credentials
   * @param username user's mail
   * @param password user's password
   * @return Observable<boolean> - true if login was successful, false if wrong credentials were supplied
   */
  public login(username: string, password: string): Observable<boolean> {
    return this.http.authorizeForm('password', username, password, 'response')
      .pipe(
        mapTo(true),
        catchError((resp: Response) => {
          if (resp.status === 400 || resp.status === 401) {
            // Wrong password
            return of(false);
          }
          // Some other error
          throw new HttpErrorResponse({error: resp});
        })
      );
  }
}
