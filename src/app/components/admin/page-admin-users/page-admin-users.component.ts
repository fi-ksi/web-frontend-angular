import { Component, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { User, UserRole } from 'src/api/backend';
import { AdminBaseComponent } from '../base/admin-base.component';
import { IconService, ModalService, RoutesService } from 'src/app/services';
import { AdminUsersService } from 'src/app/services/admin/admin-users.service';
import { FormBuilder } from '@angular/forms';
import { map } from 'rxjs/operators';

@Component({
  selector: 'ksi-page-admin-users',
  templateUrl: './page-admin-users.component.html',
  styleUrls: ['./page-admin-users.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class PageAdminUsersComponent extends AdminBaseComponent<User> {
  loadItemsFunction = () => this.userService.getUsers();
  deleteFunction = (itemId: number) => {
    let res = this.userService.deleteUser(itemId)
    this.filterUsers();
    return res;
  };

  allRoles: string[] = Object.values(UserRole);

  form = this.fb.group({
    text_filter: [''],
    allowed_roles: this.fb.array(this.allRoles)
  });

  filtered_users: User[] = [];

  constructor(
    public icon: IconService,
    public fb: FormBuilder,
    public userService: AdminUsersService,
    public routes: RoutesService,
    protected cdr: ChangeDetectorRef,
    protected modal: ModalService,
  ) {
    super(modal, cdr);
  }

  setRoleFilter(event: any, role: string): void {
    const isChecked = (event.target as HTMLInputElement).checked;
    if (isChecked) {
      this.form.value['allowed_roles'].push(role);
    } else {
      const index = this.form.value['allowed_roles'].indexOf(role);
      if (index > -1) {
        this.form.value['allowed_roles'].splice(index, 1);
      }
    }
    this.filterUsers();
  }

  filterUsers(): void {
    const filterValue = this.form.value.text_filter?.toLowerCase() || '';
    this.items.pipe(map(users => {
      this.filtered_users = users.filter(user =>
        user.first_name.toLowerCase().includes(filterValue)
      );
    })).subscribe();
    this.items.pipe(map(users => {
      this.filtered_users = users.filter(user =>
        (this.form.value['allowed_roles'].includes(user.role)) &&
        (user.first_name.toLowerCase().startsWith(filterValue) ||
          user.last_name.toLowerCase().startsWith(filterValue) ||
          (user.nick_name && user.nick_name.toLowerCase().startsWith(filterValue)) ||
          (user.email && user.email.toLowerCase().startsWith(filterValue)))
      );
      this.cdr.markForCheck();
    })).subscribe();
  }


  ngOnInit(): void {
    super.ngOnInit();

    this.items.subscribe(() => {
      this.filterUsers();
    });
  }
}
