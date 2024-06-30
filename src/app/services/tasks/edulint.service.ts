import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { APIService, Configuration, WebService } from '../../../api/edulint';
import { environment } from '../../../environments/environment';
import { combineLatest, Observable, of } from 'rxjs';
import {catchError, filter, map, mergeMap, shareReplay, take} from 'rxjs/operators';
import { EdulintReport } from '../../models';

@Injectable({
  providedIn: 'root'
})
export class EdulintService {
  readonly linter: APIService;
  readonly editor: WebService;
  readonly version: string;
  readonly url: string;
  readonly config: string;

  constructor(private httpClient: HttpClient) {
    const config = environment.edulint;

    this.version = config.version;
    this.url = config.url;
    this.config = config.config;

    this.linter = new APIService(this.httpClient, this.url, new Configuration());
    this.editor = new WebService(this.httpClient, this.url, new Configuration());
  }

  analyzeCode(code: string): Observable<EdulintReport> {
    code += `\n# edulint: config=${this.config}\n`;

    return this.linter.apiCodePost({code}).pipe(
      take(1),
      shareReplay(1),
      catchError((e) => {
        environment.logger.error('[EduLint] Code post error', e);
        return of({hash: undefined});
      }),
      filter((response) => response.hash !== undefined),
      map(response => `${response.hash}`),
      mergeMap((hash) => combineLatest([this.linter.analyzeUploaded(this.version, hash), of(hash)])),
      take(1),
      shareReplay(1),
      map(([analyzed, hash]) => ({
        problems: analyzed.problems || [],
        editorUrl:  `${this.url}/editor/${hash}`
      }))
    );
  }
}
