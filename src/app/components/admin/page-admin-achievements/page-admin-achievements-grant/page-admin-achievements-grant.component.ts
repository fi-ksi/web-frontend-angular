import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, ViewChild, ElementRef } from '@angular/core';
import { User } from 'src/api/backend';
import { IconService } from 'src/app/services/shared/icon.service';
import { Router } from '@angular/router';
import { ModalService, RoutesService } from 'src/app/services';
import { FormBuilder, Validators } from '@angular/forms';
import { AdminAchievementsService } from 'src/app/services/admin/admin-achievements.service';
import { Observable, OperatorFunction } from 'rxjs';
import { debounceTime, distinctUntilChanged, map, withLatestFrom } from 'rxjs/operators';
import { AdminUsersService } from 'src/app/services/admin/admin-users.service';

@Component({
  selector: 'ksi-page-admin-achievements-grant',
  templateUrl: './page-admin-achievements-grant.component.html',
  styleUrls: ['./page-admin-achievements-grant.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PageAdminAchievementsGrantComponent implements OnInit {
  form = this.fb.group({
    users: [[], [Validators.required]],
    task: [null, []],
    achievement: [null, [Validators.required]],
  });

  selectedUser: any = null;
  errors: string[] = [];
  achievements = this.achievementsService.getAchievements();

  @ViewChild('userInput') userInput!: ElementRef;

  constructor(
    public icon: IconService,
    public router: Router,
    public routes: RoutesService,
    protected cdr: ChangeDetectorRef,
    public fb: FormBuilder,
    protected modal: ModalService,
    public cdRef: ChangeDetectorRef,
    public adminUsersService: AdminUsersService,

    public achievementsService: AdminAchievementsService
  ) {
    const achievementId = this.router.routerState.root.snapshot.queryParams['achievement'];
    if (achievementId) this.form.patchValue({ achievement: achievementId });

    const users = this.router.routerState.root.snapshot.queryParams['users'];
    if (users) this.form.patchValue({ users: users.split(',').map((id: string) => parseInt(id)) });

    const taksId = this.router.routerState.root.snapshot.queryParams['task'];
    if (taksId) this.form.patchValue({ task: taksId });
  }

  ngOnInit(): void {
  }

  grantAchievement() {
    console.log(this.form.value, 1);

    this.errors = [];
    this.achievementsService.grantAchievement(this.form.value).subscribe({
      next: (errors) => {
        if (errors.errors && errors.errors.length > 0) {
          this.errors = errors.errors.map((e: any) => e.title);


          this.cdr.markForCheck();
          console.error('Errors while granting achievement:', errors.errors);
          return;
        }
        this.modal.yesNo(`Achievement granted successfully 🎉. Do you want to get back to the achievements list?`).pipe()
          .subscribe(yes => {
            if (yes) {
              this.router.navigate(['/', this.routes.routes.admin._, this.routes.routes.admin.achievements._]);
            }
          });
      },
      error: (err) => {
        console.error('Error while saving:', err);
        this.modal.yesNo(`Failed to save year. Do you want to try again?`).pipe()
          .subscribe(yes => {
            if (yes) {
              this.grantAchievement();
              this.router.navigate(['/', this.routes.routes.admin._, this.routes.routes.admin.achievements._]);
            }
          });
      }
    });
  }

  save() {
    console.log(this.form.value);
    if (this.form.valid) {
      this.grantAchievement();
    } else {
      console.log("invalid");
      this.form.markAllAsTouched();
    }
  }

  addUser() {
    if (this.selectedUser) {
      const users = this.form.get('users')?.value || [];
      if (!users.includes(this.selectedUser)) {
        users.push(this.selectedUser.id);
        this.form.get('users')?.setValue(users);
      }
      this.selectedUser = null;
      this.userInput.nativeElement.value = '';
      this.cdr.markForCheck();
      this.userInput.nativeElement.focus();
    }
  }

  removeUser(user: any) {
    const users = this.form.get('users')?.value;
    const index = users.indexOf(user);
    if (index > -1) {
      users.splice(index, 1);
      this.form.get('users')?.setValue(users);
    }
  }


  // ------- User typeahead -------
  users = this.adminUsersService.getUsers();
  user_formatter = (user: User) => `${user.id} - ${user.first_name} ${user.last_name}`;

  search_user: OperatorFunction<string, readonly User[]> = (text$: Observable<string>) =>
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

}
