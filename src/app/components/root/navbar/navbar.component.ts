import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import {
  YearsService,
  WindowService,
  ModalService,
  BackendService,
  RoutesService,
  ThemeService
} from 'src/app/services';
import { BehaviorSubject, combineLatest, merge, Observable, Subject } from 'rxjs';
import { filter, map, mapTo, tap } from 'rxjs/operators';
import { YearSelect } from "../../../models";
import { BasicProfileResponseBasicProfile } from "../../../../api";
import { RouteConfigLoadEnd, RouteConfigLoadStart, Router } from "@angular/router";

@Component({
  selector: 'ksi-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NavbarComponent implements OnInit {
  useLongTitle$: Observable<boolean>;
  showFullMenu$: Observable<boolean>;
  showMenuOpener$: Observable<boolean> = this.window.isMobileSmall$;

  selectableYears$: Observable<YearSelect[]>;

  user$: Observable<BasicProfileResponseBasicProfile | null>;

  loadingNewPage$: Observable<boolean>;

  private readonly showFullMenuSubject: Subject<boolean> = new BehaviorSubject<boolean>(false);

  constructor(
    private window: WindowService,
    public years: YearsService,
    public modal: ModalService,
    public backend: BackendService,
    public routes: RoutesService,
    public theme: ThemeService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadingNewPage$ = this.router.events.pipe(
      filter((x) => x instanceof RouteConfigLoadStart || x instanceof RouteConfigLoadEnd),
      map((x) => x instanceof RouteConfigLoadStart)
    );

    this.user$ = this.backend.user$.pipe(
      tap((user) => {
        if (user) {
          this.modal.hideLoginModal();
        }
      })
    );

    this.useLongTitle$ = this.window.windowSize$.pipe(
      map((size) => size.width > 1150)
    );

    this.showFullMenu$ = combineLatest([
      this.window.isMobileSmall$,
      merge(
        this.window.pageScroll$.pipe(mapTo(false)),
        this.showFullMenuSubject.asObservable()
      )
    ]).pipe(map(([isMobileSmall, showOverride]) => !isMobileSmall || showOverride));

    // filter out currently selected year from the selection
    this.selectableYears$ = combineLatest([this.years.all$, this.years.selected$]).pipe(
      map(([years, selected]) => years.filter((year) => year.id !== selected?.id))
    );
  }

  showFullMenu(): void {
    this.showFullMenuSubject.next(true);
  }

  hideFullMenu(e: MouseEvent): false {
    e.stopPropagation();
    this.showFullMenuSubject.next(false);
    return false;
  }

  switchTheme(): void {
    if (this.theme.theme === 'dark') {
      this.theme.setLightTheme();
    } else {
      this.theme.setDarkTheme();
    }
  }
}
