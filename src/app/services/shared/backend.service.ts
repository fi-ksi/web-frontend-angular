import { Injectable } from '@angular/core';
import {
  AuthResponse,
  BasicProfileResponseBasicProfile,
  Configuration,
  DefaultService
} from '../../../api';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { environment } from "../../../environments/environment";
import { BehaviorSubject, Observable, of, Subject } from "rxjs";
import { catchError, map, mapTo, mergeMap, tap } from "rxjs/operators";
import { Router } from "@angular/router";

@Injectable({
  providedIn: 'root'
})
export class BackendService {
  readonly http: DefaultService;

  private timerRefreshToken: number | null = null;

  private static readonly KEY_SESSION_STORAGE = 'auth_session';

  private readonly loginSubject: Subject<boolean> = new BehaviorSubject<boolean>(false);

  user$: Observable<BasicProfileResponseBasicProfile | null> = this.loginSubject.asObservable().pipe(
    mergeMap((loginOk) => {
      if (!loginOk) {
        return of(null);
      }
      return this.http.basicProfileGetSingle().pipe(map((resp) => resp.basicProfile));
    })
  );

  constructor(private httpClient: HttpClient, private router: Router) {
    this.http = new DefaultService(this.httpClient, environment.backend, new Configuration());
    this.loadSession().subscribe();
  }

  /**
   * Tries to login with given credentials
   * @param username user's mail
   * @param password user's password
   * @return Observable<boolean> - true if login was successful, false if wrong credentials were supplied
   */
  public login(username: string, password: string): Observable<boolean> {
    return this.handleLogin(this.http.authorizeForm('password', username, password));
  }

  /**
   * Logs user ouf and deletes saved session
   */
  public logout(): void {
    localStorage.removeItem(BackendService.KEY_SESSION_STORAGE);
    this.loginSubject.next(false);
    this.deleteSession();
    this.router.navigate(['/']).then();
  }

  /**
   * Refreshes the login token by using refresh token
   * @param token
   * @private
   */
  private refreshToken(token: string): Observable<boolean> {
    environment.logger.debug('refreshing login token');
    return this.handleLogin(this.http.authorizeForm('refresh_token', undefined, undefined, token));
  }

  /**
   * Loads saved session from the storage
   * @private
   */
  private loadSession(): Observable<boolean> {
    const sessionStr = localStorage.getItem(BackendService.KEY_SESSION_STORAGE);
    if (!sessionStr) {
      return of(false);
    }
    const session: AuthResponse = JSON.parse(sessionStr);
    return this.refreshToken(session.refresh_token);
  }

  /**
   * Deletes saved login session
   * @private
   */
  private deleteSession(): void {
    if (this.timerRefreshToken !== null) {
      clearTimeout(this.timerRefreshToken);
    }
    localStorage.removeItem(BackendService.KEY_SESSION_STORAGE);
    this.http.configuration.accessToken = undefined;
  }

  /**
   * Saves login session and schedules automatic renewal
   * @param session
   * @private
   */
  private saveSession(session: AuthResponse): void {
    localStorage.setItem(BackendService.KEY_SESSION_STORAGE, JSON.stringify(session));
    this.http.configuration.accessToken = session.access_token;
    if (this.timerRefreshToken !== null) {
      clearTimeout(this.timerRefreshToken);
    }

    // schedule automatic token renewal
    this.timerRefreshToken = setTimeout(
      () => this.refreshToken(session.refresh_token).subscribe(),
      session.expires_in * 0.9
    );
  }

  /**
   * Handles login response and saves session
   * @param auth$ password login or refresh token request
   * @private
   */
  private handleLogin(auth$: Observable<AuthResponse>): Observable<boolean> {
    return auth$.pipe(
      tap((resp) => {
        environment.logger.debug('auth successful', resp);
        this.saveSession(resp);
      }),
      mapTo(true),
      tap((loginOk) => this.loginSubject.next(loginOk)),
      catchError((resp: HttpErrorResponse) => {
        if (resp.status === 400 || resp.status === 401) {
          // Wrong password or refresh token
          environment.logger.debug('auth failed', resp);
          this.deleteSession();
          return of(false);
        }
        // Some other error
        throw new HttpErrorResponse({error: resp});
      })
    );
  }
}
