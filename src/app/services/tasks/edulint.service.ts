import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { APIService, Configuration } from '../../../api/edulint';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class EdulintService {
  readonly linter: APIService;

  constructor(private httpClient: HttpClient) {
    this.linter = new APIService(this.httpClient, environment.edulint, new Configuration());
  }
}
