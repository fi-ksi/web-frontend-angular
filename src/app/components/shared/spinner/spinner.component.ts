import { Component, OnInit, ChangeDetectionStrategy, Input } from '@angular/core';
import { concat, interval, Observable, of } from "rxjs";
import { mapTo } from "rxjs/operators";

@Component({
  selector: 'ksi-spinner',
  templateUrl: './spinner.component.html',
  styleUrls: ['./spinner.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SpinnerComponent implements OnInit {
  @Input()
  source: Observable<any>;

  show$: Observable<boolean>;
  keepTransparent$: Observable<boolean>;

  constructor() { }

  ngOnInit(): void {
    this.show$ = concat(of(true), this.source.pipe(mapTo(false)));
    this.keepTransparent$ = concat(of(true), interval(50).pipe(mapTo(false)));
  }

}
