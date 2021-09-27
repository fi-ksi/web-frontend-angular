import { Component, OnInit } from '@angular/core';
import { WindowService } from "src/app/services";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";

@Component({
  selector: 'ksi-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit {
  useLongTitle$: Observable<boolean>;

  constructor(private window: WindowService) {
    this.useLongTitle$ = this.window.windowSize$.pipe(
      map((size) => size.width > 800)
    )
  }

  ngOnInit(): void {
  }

}
