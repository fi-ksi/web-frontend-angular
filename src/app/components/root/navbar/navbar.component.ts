import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { YearsService, WindowService } from 'src/app/services';
import { combineLatest, Observable } from 'rxjs';
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

  selectableYears$: Observable<YearSelect[]>;

  constructor(private window: WindowService, public years: YearsService) {
    this.useLongTitle$ = this.window.windowSize$.pipe(
      map((size) => size.width > 800)
    );

    // filter out currently selected year from the selection
    this.selectableYears$ = combineLatest([this.years.all$, this.years.selected$]).pipe(
      map(([years, selected]) => years.filter((year) => year.id !== selected?.id))
    );
  }

  ngOnInit(): void {
  }

}
