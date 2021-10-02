import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { WindowSize } from '../../models';
import { PageScroll } from "../../models/window.service";
import { map } from "rxjs/operators";

@Injectable({
  providedIn: 'root'
})
export class WindowService {
  get windowSize$(): Observable<WindowSize> {
    return this._windowSize$;
  }

  get pageScroll$(): Observable<PageScroll> {
    return this._pageScroll$;
  }

  get isMobile$(): Observable<boolean> {
    return this._isMobile$;
  }

  get isMobileSmall$(): Observable<boolean> {
    return this._isSmallMobile$;
  }

  private set pageScroll(value: PageScroll) {
    this._pageScroll = value;
    this._pageScrollSubject.next(value);
  }

  private _sizeChangeSubject = new BehaviorSubject<WindowSize>(WindowService.getWindowSize());

  private _pageScrollSubject = new BehaviorSubject<PageScroll>(WindowService.getInitialScroll());
  private _pageScroll: PageScroll = WindowService.getInitialScroll();

  private readonly _windowSize$: Observable<WindowSize>;
  private readonly _isMobile$: Observable<boolean>;
  private readonly _isSmallMobile$: Observable<boolean>;

  private readonly _pageScroll$: Observable<PageScroll>;

  // should be kept in-sync with $ksi-max-mobile-width and $ksi-max-small-mobile-width inside src/app/styles/vars.css
  private static readonly SIZE_MOBILE = 900;
  private static readonly SIZE_MOBILE_SMALL = 850;

  constructor() {
    this._windowSize$ = this._sizeChangeSubject.asObservable();
    this._isMobile$ = this.windowSize$.pipe(map((size) => size.width <= WindowService.SIZE_MOBILE));
    this._isSmallMobile$ = this.windowSize$.pipe(map((size) => size.width <= WindowService.SIZE_MOBILE_SMALL));
    this._pageScroll$ = this._pageScrollSubject.asObservable();

    // hook window change events
    window.addEventListener('resize', () => {
      this._sizeChangeSubject.next(WindowService.getWindowSize());
    });

    // hook scroll events
    window.addEventListener('load', () => {
      const appContent = document.getElementById('ksi-app-page-content');
      if (!appContent) {
        throw new Error("Cannot find app content");
      }
      appContent.addEventListener('scroll', (event) => {
        const now = (event.target as HTMLElement).scrollTop;
        const before = this._pageScroll.depth;
        this.pageScroll = {depth: now, change: now - before};
      })
    })
  }

  private static getWindowSize(): WindowSize {
    return document.body.getBoundingClientRect();
  }

  private static getInitialScroll(): PageScroll {
    return {depth: 0, change: 0};
  }
}
