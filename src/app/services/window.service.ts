import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from "rxjs";
import { WindowSize } from "../models/";

@Injectable({
  providedIn: 'root'
})
export class WindowService {
  get windowSize$(): Observable<WindowSize> {
    return this._windowSize$;
  }

  private _sizeChangeSubject = new BehaviorSubject<WindowSize>(WindowService.getWindowSize());

  private readonly _windowSize$: Observable<WindowSize>;

  constructor() {
    this._windowSize$ = this._sizeChangeSubject.asObservable();
    window.addEventListener('resize', () => {
      this._sizeChangeSubject.next(WindowService.getWindowSize());
    });
  }

  private static getWindowSize(): WindowSize {
    return document.body.getBoundingClientRect();
  }
}
