import { Component, OnInit, ChangeDetectionStrategy, OnDestroy } from '@angular/core';
import { IconService, RoutesService, UserService, WindowService } from '../../../services';
import {BehaviorSubject, combineLatest, Observable, Subscription} from 'rxjs';
import {filter, map, mergeMap} from 'rxjs/operators';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'ksi-admin-sidebar',
  templateUrl: './admin-sidebar.component.html',
  styleUrls: ['./admin-sidebar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdminSidebarComponent implements OnInit, OnDestroy {
  private _subs: Subscription[] = [];

  visible$: Observable<boolean>;

  private readonly hideSubject = new BehaviorSubject(true);

  oldFrontendUrl = environment.oldFrontendUrl;

  oldFrontendButtons = [
    ['users/', 'Uživatelé'],
    ['years/', 'Ročníky'],
    ['waves/', 'Vlny'],
    ['execs/', 'Spuštění'],
    ['opravovani/', 'Opravování'],
    ['achievements/', 'Trofeje'],
  ]

  constructor(
    public routes: RoutesService,
    public userService: UserService,
    private router: Router,
    public window: WindowService,
    public icon: IconService
  ) { }

  ngOnInit(): void {
    this._subs.push(this.userService.forceLogin$.pipe(
      mergeMap(() => this.userService.isTester$),
      filter((x) => !x)
    ).subscribe(() => {
      // Leave admin menu when the users logs off
      this.router.navigate(['/']).then();
    }));

    this.visible$ = combineLatest([this.window.isMobile$, this.hideSubject.asObservable()]).pipe(map(
      ([isMobile, hideNow]) => {
        return !isMobile || !hideNow;
      }
    ));
  }

  ngOnDestroy(): void {
    this._subs.forEach((s) => s.unsubscribe());
  }

  hideFullMenu(event: MouseEvent): false {
    this.hideSubject.next(true);
    event.stopPropagation();
    return false;
  }

  showFullMenu(event: MouseEvent): false {
    this.hideSubject.next(false);
    event.stopPropagation();
    return false;
  }

  openExternal(event: MouseEvent): void {
    const anchor = event.target as HTMLAnchorElement;
    window.open(anchor.href, '_blank');
  }
}
