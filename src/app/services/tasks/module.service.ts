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

  /**
   * Gets an observable that fires whenever there is a new submit status for given module
   * @param module
   */
  public statusChanges(module: KSIModule): Observable<ModuleSubmitResponse | null> {
    return this.moduleResult$.pipe(
      filter((data) => data.module.id === module.id),
      map((data) => data.result),
      shareReplay(1)
    );
  }

  /**
   * Executes code for programming module
   * @param module
   * @param code
   */
  public runCode(module: ModuleProgramming, code: string): Observable<RunCodeResponse> {
    return this.backend.http.runCode({content: code}, module.id);
  }

  /**
   * Hides last submit result
   * @param module
   */
  public hideSubmit(module: KSIModule): void {
    this.moduleResultSubject.next({module, result: null});
  }

  /**
   * Submits module data and subscribes for result.
   * Result can be obtained by listening to this.statusChanges(module)
   * @param module
   * @param body
   */
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
      if (!result.message) {
        result.message = this.translate.instant(`tasks.module.result.${result.result}`)
      }

      this.moduleResultSubject.next({module, result});
    });
  }
}
