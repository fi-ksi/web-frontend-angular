import { Injectable } from '@angular/core';
import {
  AuthResponse,
  BasicProfileResponseBasicProfile,
  Configuration,
  DefaultService
} from '../../../api/backend';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { BehaviorSubject, combineLatest, Observable, of, Subject } from 'rxjs';
import { catchError, distinctUntilChanged, map, mapTo, mergeMap, shareReplay, tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { StorageService } from './storage.service';
import { UsersCacheService } from './users-cache.service';
import { v4 as uuidv4 } from 'uuid';
import { AuthMessage, AuthMessageAction } from '../../models';

@Injectable({
  providedIn: 'root'
})
export class BackendService {
  readonly http: DefaultService;

  private timerRefreshToken: number | null = null;

  private readonly authStorage = this.storageRoot.open('auth');

  private readonly loginSubject: Subject<boolean> = new BehaviorSubject<boolean>(false);

  private readonly refreshUserSubject: Subject<undefined> = new BehaviorSubject(undefined);

  private readonly loginBroadcastChannel = new BroadcastChannel('ksi-login');

  private static readonly instanceId: string = uuidv4();

  user$: Observable<BasicProfileResponseBasicProfile | null> = combineLatest(
    [this.loginSubject.asObservable(), this.refreshUserSubject.asObservable()]
  ).pipe(
    distinctUntilChanged(),
    mergeMap(([loginOk, _]) => {
      if (!loginOk) {
        return of(null);
      }
      return this.http.basicProfileGetSingle().pipe(
        map((resp) => {
          if (resp?.basicProfile?.signed_in) {
            return {...resp.basicProfile, profile_picture: UsersCacheService.getProfilePicture(resp.basicProfile, false)};
          }
          this.logout();
          return null;
        }));
    }),
    shareReplay(1)
  );

  constructor(private httpClient: HttpClient, private router: Router, private storageRoot: StorageService) {
    this.http = new DefaultService(this.httpClient, environment.backend, new Configuration());
    this.loadSession().subscribe(() => {
      // Listen for session changes in other tabs
      this.loginBroadcastChannel.onmessage = (message: MessageEvent<AuthMessage>) => {
        if (message.data.source === BackendService.instanceId) {
          return;
        }
        switch (message.data.action) {
        case 'delete':
          environment.logger.debug('[auth] got message to delete session');
          this.logout();
          break;
        case 'refresh':
          environment.logger.debug('[auth] got message to refresh session');
          this.applySession(message.data.session!);
          break;
        }
      };
    });
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
    this.deleteSession();
    this.loginSubject.next(false);
  }

  /**
   * Force refreshes user data without need to log in and out first
   */
  public refreshUser(): void {
    this.refreshUserSubject.next();
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
    const sessionAbsolute = this.authStorage.get<AuthResponse>('session');
    environment.logger.debug('[auth] loaded login session from storage', sessionAbsolute);
    if (!sessionAbsolute) {
      this.loginSubject.next(false);
      return of(false);
    }
    const session: AuthResponse = {
      ...sessionAbsolute,
      // convert absolutely saved date back to the relative one
      expires_in: Math.floor((sessionAbsolute.expires_in - Date.now()) / 1000)
    };
    if (session.expires_in > 0) {
      // not for renewal yet
      this.applySession(session);
      return of(true);
    } else {
      // renew saved sesion
      return this.refreshToken(session.refresh_token);
    }
  }

  /**
   * Deletes saved login session
   * @private
   */
  private deleteSession(): void {
    if (this.timerRefreshToken !== null) {
      clearTimeout(this.timerRefreshToken);
    }
    this.http.configuration.accessToken = undefined;
    if (this.authStorage.get('session')) {
      this.authStorage.delete('session');
      this.broadcastLoginAction('delete');
    }
  }

  /**
   * Saves login session and applies it
   * @param session
   * @private
   */
  private saveSession(session: AuthResponse): void {
    this.authStorage.set('session',{
      ...session,
      expires_in: Date.now() + (session.expires_in * 1000) // save expiration time as absolute time
    });
    this.broadcastLoginAction('refresh', session);
    this.applySession(session);
  }

  /**
   * Only applies the session without saving it
   * @param session
   * @private
   */
  private applySession(session: AuthResponse): void {
    environment.logger.debug('[auth] setting new session', session);
    this.http.configuration.accessToken = session.access_token;
    this.loginSubject.next(true);
    if (this.timerRefreshToken !== null) {
      clearTimeout(this.timerRefreshToken);
    }

    // schedule automatic token renewal
    this.timerRefreshToken = window.setTimeout(
      () => this.refreshToken(session.refresh_token).subscribe(),
      Math.floor(session.expires_in * 1000 * 0.9)
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
      }),
      distinctUntilChanged()
    );
  }

  /**
   * Sends event notification about login to all opened tabs
   * @param action action to perform
   * @param session the session to send along the message
   * @private
   */
  private broadcastLoginAction(action: AuthMessageAction, session?: AuthResponse) {
    const message: AuthMessage = {
      source: BackendService.instanceId,
      action,
      session
    };
    this.loginBroadcastChannel.postMessage(message);
  }
}
