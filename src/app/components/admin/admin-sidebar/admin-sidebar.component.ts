import { Component, OnInit, ChangeDetectionStrategy, OnDestroy } from '@angular/core';
import { RoutesService, UserService } from '../../../services';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { Router } from '@angular/router';

@Component({
  selector: 'ksi-admin-sidebar',
  templateUrl: './admin-sidebar.component.html',
  styleUrls: ['./admin-sidebar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdminSidebarComponent implements OnInit, OnDestroy {
  private _subs: Subscription[] = [];

  constructor(public routes: RoutesService, private userService: UserService, private router: Router) { }

  ngOnInit(): void {
    this._subs.push(this.userService.isTester$.pipe(filter((x) => !x)).subscribe(() => {
      // Leave admin menu when the users logs off
      this.router.navigate(['/']).then();
    }));
  }

  ngOnDestroy(): void {
    this._subs.forEach((s) => s.unsubscribe());
  }

  hideFullMenu(event: MouseEvent) {
    // TODO: implement
  }
}
