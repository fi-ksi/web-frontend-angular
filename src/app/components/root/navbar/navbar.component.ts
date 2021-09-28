import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { BackendService, WindowService } from 'src/app/services';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Year } from '../../../../api';

@Component({
  selector: 'ksi-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NavbarComponent implements OnInit {
  useLongTitle$: Observable<boolean>;

  years$: Observable<Year[]>;

  constructor(private window: WindowService, private backend: BackendService) {
    this.useLongTitle$ = this.window.windowSize$.pipe(
      map((size) => size.width > 800)
    );
    this.years$ = this.backend.http.yearsGetAll().pipe(map((resp) => resp.years));
  }

  ngOnInit(): void {
  }

}
