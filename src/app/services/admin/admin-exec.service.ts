import { Injectable } from '@angular/core';
import { BackendService } from '../shared';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Execution, ExecutionResult, ExecutionsResponse } from 'src/api/backend';

@Injectable({
  providedIn: 'root'
})
export class AdminExecService {

  constructor(
        private backend: BackendService,
  ) { }

  public getExecutions(user?: number, module?: number, limit?: number, page?: number, from?: string, to?: string, result?: ExecutionResult, year?: number, observe?: 'body', reportProgress?: boolean): Observable<ExecutionsResponse> {
    return this.backend.http.adminExecutionGetMultiple(user, module, limit, page);
  }

}
