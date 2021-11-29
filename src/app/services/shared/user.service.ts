import { Injectable } from '@angular/core';
import { BackendService } from "./backend.service";
import { combineLatest, Observable } from "rxjs";
import { UserRole } from "../../../api";
import { map } from "rxjs/operators";

@Injectable({
  providedIn: 'root'
})
export class UserService {
  readonly role$: Observable<UserRole | null>;

  readonly isAdmin$: Observable<boolean>;

  readonly isOrg$: Observable<boolean>;

  readonly isTester$: Observable<boolean>;

  readonly isParticipant$: Observable<boolean>;

  readonly isParticipantHidden$: Observable<boolean>;

  constructor(private backend: BackendService) {
    // prepare role observables
    this.role$ = backend.user$.pipe(map((user) => user?.role || null));
    this.isAdmin$ = this.role$.pipe(map((role) => role === 'admin'));
    this.isOrg$ = combineLatest([this.isAdmin$, this.role$])
      .pipe(map(([isAdmin, role]) => isAdmin || role === 'org'));
    this.isTester$ = combineLatest([this.isOrg$, this.role$])
      .pipe(map(([isOrg, role]) => isOrg || role === 'tester'));
    this.isParticipant$ = combineLatest([this.isTester$, this.role$])
      .pipe(map(([isTester, role]) => isTester || role === 'participant'));
    this.isParticipantHidden$ = combineLatest([this.isParticipant$, this.role$])
      .pipe(map(([isParticipant, role]) => isParticipant || role === 'participant_hidden'));
  }
}
