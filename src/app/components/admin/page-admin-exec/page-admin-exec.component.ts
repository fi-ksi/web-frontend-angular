import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, OnDestroy, ViewChild, TemplateRef } from '@angular/core';
import { AdminBaseComponent } from '../base/admin-base.component';
import { IconService, ModalService, RoutesService, UserService } from 'src/app/services';
import { AdminWavesService } from 'src/app/services/admin/admin-waves.service';
import { Observable, OperatorFunction, Subscription } from 'rxjs';
import { shareReplay } from 'rxjs/operators';
import { Execution, User } from 'src/api/backend';
import { AdminExecService } from 'src/app/services/admin/admin-exec.service';
import { debounceTime, distinctUntilChanged, map, withLatestFrom } from 'rxjs/operators';
import { FormBuilder, Validators } from '@angular/forms';
import { AdminUsersService } from 'src/app/services/admin/admin-users.service';
@Component({
  selector: 'ksi-page-admin-exec',
  templateUrl: './page-admin-exec.component.html',
  styleUrls: ['./page-admin-exec.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})


export class PageAdminExecComponent implements OnInit, OnDestroy {
  subscriptions: Subscription[] = [];

  @ViewChild('modalInfo', { static: true })
  modalInfo: TemplateRef<unknown>;


  form = this.fb.group({
    user: [null, [Validators.required]],
    moduleId: [null, [Validators.required]]
  });

  execs: any[] = [];
  page: number = 1;
  pageSize: number = 10;
  collectionSize: number = 0;

  constructor(
    public icon: IconService,
    public routes: RoutesService,
    public execService: AdminExecService,
    public fb: FormBuilder,
    public adminUsersService: AdminUsersService,
    protected cdr: ChangeDetectorRef,
    protected modal: ModalService,
    protected adminWavesService: AdminWavesService
  ) {
  }

  formatter = (result: User) => result.email!;
  users = this.adminUsersService.getUsers().pipe(shareReplay(1));
  executions: Execution[] = [];

  private usersCache: User[] = [];

  data_loaded: boolean = false;

  user_formatter = (user: User) => `${user.id} - ${user.first_name} ${user.last_name}`;

  search: OperatorFunction<string, readonly User[]> = (text$: Observable<string>) =>
    text$.pipe(
      debounceTime(200),
      distinctUntilChanged(),
      withLatestFrom(this.users),
      map(([term, users]) => {
        return users.filter(user =>
          this.user_formatter(user).toLowerCase().includes(term.toLowerCase())
        ).slice(0, 10);
      })
    );

  total_execs: number = 0;
  selected: number = -1;

  load_new_execs(): void {
    this.page = 1;
    this.load_execs();
    this.selected = -1;
  }

  load_execs(): void {
    this.data_loaded = false;
    if (!this.form.valid) {
      this.form.markAllAsTouched();
      return;
    }

    const userId = this.resolveUserId();
    if (userId === null) {
      // the user typed text but did not pick a user from the dropdown,
      // so there is no user id to filter by
      const userControl = this.form.get('user');
      if (userControl) {
        userControl.setErrors({ ...userControl.errors, userNotSelected: true });
        userControl.markAsTouched();
      }
      return;
    }

    const sub = this.execService.getExecutions(userId, this.form.value.moduleId, this.pageSize, this.page - 1).subscribe(res => {
      this.executions = res.execs;
      this.total_execs = res.meta.total;
      this.data_loaded = true;
      this.cdr.markForCheck();
    });
    this.subscriptions.push(sub);
  }

  /**
   * Resolves the user form control value to a user id.
   * The typeahead stores a User object only when an item is picked from the
   * dropdown; plain typed text is resolved against loaded users, otherwise null.
   */
  private resolveUserId(): number | null {
    const value = this.form.get('user')?.value;
    if (value !== null && typeof value === 'object' && typeof value.id === 'number') {
      return value.id;
    }
    if (typeof value === 'string') {
      const term = value.trim().toLowerCase();
      if (term) {
        const matches = this.usersCache.filter((user) =>
          this.user_formatter(user).toLowerCase() === term ||
          (user.email != null && user.email.toLowerCase() === term)
        );
        if (matches.length === 1) {
          return matches[0].id;
        }
      }
    }
    return null;
  }

  ngOnInit(): void {
    this.subscriptions.push(
      this.users.subscribe((users) => {
        this.usersCache = users ?? [];
      })
    );
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  showInfo(): void {
    this.modal.showModalTemplate(this.modalInfo, 'Info');
  }
}
