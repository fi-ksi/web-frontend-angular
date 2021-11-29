import { Injectable } from '@angular/core';
import { BackendService } from "../shared/backend.service";
import { KSIModule, ModuleSubmissionData, ModuleSubmitResponse } from "../../../api";
import { Observable, Subject } from 'rxjs';
import { filter, map, shareReplay } from "rxjs/operators";
import { ModuleSubmitChange } from "../../models";

@Injectable({
  providedIn: 'root'
})
export class ModuleService {
  private readonly moduleResultSubject = new Subject<ModuleSubmitChange>();
  private readonly moduleResult$: Observable<ModuleSubmitChange> = this.moduleResultSubject.asObservable();

  constructor(private backend: BackendService) { }

  public statusChanges(module: KSIModule): Observable<ModuleSubmitResponse> {
    return this.moduleResult$.pipe(
      filter((data) => data.module.id === module.id),
      map((data) => data.result),
      shareReplay(1)
    );
  }

  public submit(module: KSIModule, body: ModuleSubmissionData): void {
    this.backend.http.modulesSubmitSingle(module.id, {content: body}).subscribe((result) => {
      this.moduleResultSubject.next({module, result});
    });
  }
}
