import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { take } from "rxjs/operators";
import { Changelog } from "../../models";

@Injectable({
  providedIn: 'root'
})
export class VersionService {
  private readonly _version$: Observable<string | null>;
  private readonly _changelog$: Observable<Changelog | null>

  get changelog$(): Observable<Changelog | null> {
    return this._changelog$;
  }

  get version$(): Observable<string | null> {
    return this._version$;
  }

  constructor(private http: HttpClient) {
    this._version$ = this.http
      .get('assets/changelog/version.txt', {responseType: 'text'})
      .pipe(take(1));
    this._changelog$ = this.http
      .get<Changelog>('assets/changelog/changelog.json', {responseType: 'json'})
      .pipe(take(1));
  }
}
