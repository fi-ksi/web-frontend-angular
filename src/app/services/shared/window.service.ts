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
      WindowService.getAppContent().addEventListener('scroll', (event) => {
        const now = (event.target as HTMLElement).scrollTop;
        const before = this._pageScroll.depth;
        this.pageScroll = {depth: now, change: now - before};
      })
    })
  }

  /**
   * Tests if the element is in a visible area of the content
   * @param element element to test
   * @param percentage if set, then min percentage of the element must be visible to return true, <0-100>
   * @return true if at least one pixel (if no percentage is set) or percentage of the element is visible
   */
  public static isElementVisible(element: HTMLElement, percentage?: number): boolean {
    const content = WindowService.getAppContent();
    const elementRect = element.getBoundingClientRect();
    const contentRect = content.getBoundingClientRect();

    const contentViewTop = content.scrollTop + contentRect.top;
    const contentViewBottom = contentViewTop + contentRect.height;

    const invisibleTop = Math.max(contentViewTop - elementRect.top, 0);
    const invisibleBottom = Math.max(elementRect.bottom - contentViewBottom, 0);

    if (typeof percentage === 'undefined') {
      return invisibleTop + invisibleBottom < elementRect.height;
    }

    return (invisibleTop + invisibleBottom) * 100 / elementRect.height <= percentage;
  }

  public static getAppContent(): HTMLElement {
    const appContent = document.getElementById('ksi-app-page-content');
    if (!appContent) {
      throw new Error("Cannot find app content");
    }
    return appContent;
  }

  private static getWindowSize(): WindowSize {
    return document.body.getBoundingClientRect();
  }

  private static getInitialScroll(): PageScroll {
    return {depth: 0, change: 0};
  }
}
