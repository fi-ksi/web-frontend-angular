import { Injectable } from '@angular/core';
import { BackendService } from "../shared/backend.service";
import {
  KSIModule,
  ModuleProgramming,
  ModuleSubmissionData,
  ModuleSubmitResponse, RunCodeResponse,
} from "../../../api";
import { Observable, of, Subject } from 'rxjs';
import { catchError, filter, map, mergeMap, shareReplay } from "rxjs/operators";
import { ModuleSubmitChange } from "../../models";
import { TranslateService } from "@ngx-translate/core";
import { environment } from "../../../environments/environment";
import { UserService } from "../shared/user.service";

@Injectable({
  providedIn: 'root'
})
export class ModuleService {
  private readonly moduleResultSubject = new Subject<ModuleSubmitChange>();
  private readonly moduleResult$: Observable<ModuleSubmitChange> = this.moduleResultSubject.asObservable();

  constructor(private backend: BackendService, private translate: TranslateService, private user: UserService) {
  }

  public statusChanges(module: KSIModule): Observable<ModuleSubmitResponse> {
    return this.moduleResult$.pipe(
      filter((data) => data.module.id === module.id),
      map((data) => data.result),
      shareReplay(1)
    );
  }

  public runCode(module: ModuleProgramming, code: string): Observable<RunCodeResponse> {
    return this.backend.http.runCode({content: code}, module.id);
  }

  public submit(module: KSIModule, body: ModuleSubmissionData): void {
    this.user.afterLogin$.pipe(
      mergeMap(
        () => this.backend.http.modulesSubmitSingle(module.id, {content: body})
          .pipe(
            catchError((err) => {
              environment.logger.error('Submit', err);
              const data: ModuleSubmitResponse = {
                result: 'error',
                error: this.translate.instant('tasks.module.server-error')
              };
              return of(data);
            })
          ))
    ).subscribe((result) => {
      this.moduleResultSubject.next({module, result});
    });
  }
}
