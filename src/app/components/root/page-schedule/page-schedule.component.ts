import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, ElementRef } from '@angular/core';
import { BackendService, KsiTitleService, RoutesService, WindowService, YearsService } from '../../../services';

@Component({
  selector: 'ksi-page-schedule',
  templateUrl: './page-schedule.component.html',
  styleUrls: ['./page-schedule.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PageScheduleComponent implements OnInit {

  aboutInfoSlide = 0;
  aboutInfoShown = false;

  constructor(
    private title: KsiTitleService,
    public years: YearsService,
    private backend: BackendService,
    private cd: ChangeDetectorRef,
    private elRef: ElementRef,
    public routes: RoutesService
  ) {
  }

  ngOnInit(): void {
    this.title.subtitle = null;
  }
}
