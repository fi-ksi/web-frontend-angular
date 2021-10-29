import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { YearsService, WindowService, ModalService, BackendService } from 'src/app/services';
import { combineLatest, merge, Observable, Subject } from 'rxjs';
import { map } from 'rxjs/operators';
import { YearSelect } from "../../../models";

@Component({
  selector: 'ksi-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NavbarComponent implements OnInit {
  useLongTitle$: Observable<boolean>;
  showFullMenu$: Observable<boolean>;

  selectableYears$: Observable<YearSelect[]>;

  private readonly showFullMenuSubject: Subject<void> = new Subject<void>();

  constructor(
    private window: WindowService,
    public years: YearsService,
    public modal: ModalService,
    public backend: BackendService
  ) {}

  ngOnInit(): void {
    this.useLongTitle$ = this.window.windowSize$.pipe(
      map((size) => size.width > 1150)
    );

    this.showFullMenu$ = combineLatest([
      this.window.isMobileSmall$,
      merge(
        this.window.pageScroll$.pipe(map(() => false)),
        this.showFullMenuSubject.asObservable().pipe(map(() => true))
      )
    ]).pipe(map(([isMobileSmall, showOverride]) => !isMobileSmall || showOverride));

    // filter out currently selected year from the selection
    this.selectableYears$ = combineLatest([this.years.all$, this.years.selected$]).pipe(
      map(([years, selected]) => years.filter((year) => year.id !== selected?.id))
    );
  }

  showFullMenu(): void {
    this.showFullMenuSubject.next();
  }
}
