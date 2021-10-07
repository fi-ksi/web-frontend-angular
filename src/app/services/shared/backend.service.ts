import { Injectable } from '@angular/core';
import { Configuration, DefaultService } from '../../../api';
import { HttpClient } from '@angular/common/http';
import { environment } from "../../../environments/environment";

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
}
