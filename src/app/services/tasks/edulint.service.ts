import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { APIService, Configuration, WebService } from '../../../api/edulint';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class EdulintService {
  readonly linter: APIService;
  readonly editor: WebService;

  constructor(private httpClient: HttpClient) {
    this.linter = new APIService(this.httpClient, environment.edulint, new Configuration());
    this.editor = new WebService(this.httpClient, environment.edulint, new Configuration());
  }

  getCodeEditorUrl(code: string): Observable<string> {
    return this.linter.apiCodePost({code}).pipe(
      map((response) => `${environment.edulint}editor/${response.hash}`)
    );
  }
}
