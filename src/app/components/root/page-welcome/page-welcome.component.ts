import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, ElementRef } from '@angular/core';
import { BackendService, KsiTitleService, RoutesService, WindowService, YearsService } from "../../../services";

@Component({
  selector: 'ksi-page-welcome',
  templateUrl: './page-welcome.component.html',
  styleUrls: ['./page-welcome.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PageWelcomeComponent implements OnInit {
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

  toggleAboutInfo(slide: number): void {
    if (this.aboutInfoShown && this.aboutInfoSlide === slide) {
      this.aboutInfoShown = false;
      this.cd.markForCheck();
      return;
    }

    this.aboutInfoShown = true;
    this.aboutInfoSlide = slide;
    this.cd.detectChanges();

    window.setTimeout(() => {
      const carousel = ((this.elRef.nativeElement as HTMLElement).querySelector('.about-carousel') as HTMLElement | null);
      if (!carousel) {
        return;
      }
      if (!WindowService.isElementVisible(carousel, 50)) {
        carousel.scrollIntoView({behavior: "smooth", block: "start", inline: "nearest"});
      }
    });
  }

  onAboutSlideChange(slide: number): void {
    if (!this.aboutInfoShown || this.aboutInfoSlide === slide) {
      return;
    }
    this.aboutInfoSlide = slide;
    this.cd.markForCheck();
  }

  openKScuk(): void {
    location.href = "https://kscuk.fi.muni.cz/"
  }
}
