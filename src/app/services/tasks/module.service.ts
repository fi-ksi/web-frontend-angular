import { Injectable } from '@angular/core';
import { BackendService } from "../shared/backend.service";
import {
  KSIModule,
  ModuleGeneral, ModuleGeneralSubmittedFiles,
  ModuleProgramming,
  ModuleSubmissionData,
  ModuleSubmitResponse,
  RunCodeResponse,
} from "../../../api";
import { concat, Observable, of, Subject } from 'rxjs';
import { catchError, filter, map, mergeMap, shareReplay, take } from "rxjs/operators";
import { FileUpload, ModuleSubmitChange } from "../../models";
import { TranslateService } from "@ngx-translate/core";
import { environment } from "../../../environments/environment";
import { UserService } from "../shared/user.service";
import { HttpEventType, HttpResponse } from "@angular/common/http";

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
   * Uploads single file to the server.
   * Streams progress and also result.
   * @param module
   * @param file
   */
  public uploadFile(module: ModuleGeneral, file: File): FileUpload {
    const upload$ = this.user.afterLogin$.pipe(
      mergeMap(() => this.backend.http.modulesSubmitFilesForm(file, module.id, "events", true)),
      shareReplay(1)
    );
    const progress$: Observable<number> = concat(of(0), upload$.pipe(
      filter((event) => event.type === HttpEventType.UploadProgress || event.type === HttpEventType.Sent),
      map((event) => {
        switch (event.type) {
          case HttpEventType.UploadProgress:
            return 100 * event.loaded / event.total!;
          case HttpEventType.Sent:
            return 100;
        }
        return -1;
      })));
    const response$: Observable<ModuleSubmitResponse> = upload$.pipe(
      filter((event) => event.type === HttpEventType.Response),
      take(1),
      map((event) => (event as HttpResponse<ModuleSubmitResponse>).body!)
    );

    return {progress$, response$};
  }

  public deleteFile(file: ModuleGeneralSubmittedFiles): Observable<void> {
    return this.backend.http.subFilesDeleteSingle(file.id).pipe(map(() => {}));
  }

  public downloadFile(file: ModuleGeneralSubmittedFiles): Observable<void> {
    return this.backend.http.submFilesGetSingle(file.id, ).pipe(map((response) => {
      const url =  URL.createObjectURL(response);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.filename;
      a.style.display = 'none';
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 60000);
    }));
  }

  /**
   * Executes code for programming module
   * @param module
   * @param code
   */
  public runCode(module: ModuleProgramming, code: string): Observable<RunCodeResponse> {
    return this.user.afterLogin$.pipe(mergeMap(() => this.backend.http.runCode({content: code}, module.id)));
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
