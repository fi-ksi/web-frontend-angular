import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Title } from '@angular/platform-browser';
import { BehaviorSubject, combineLatest, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class KsiTitleService {
  private _subtitleSubject: Subject<string | null> = new BehaviorSubject<string | null>(null);

  private _subtitle: string | null = null;

  set subtitle(value: string | null) {
    this._subtitle = value;
    this._subtitleSubject.next(value);
  }

  private static readonly KEY_TITLE_LONG = 'root.navbar.title.long';
  private static readonly KEY_TITLE_SHORT = 'root.navbar.title.short';

  constructor(private translate: TranslateService, private title: Title) {
    combineLatest([
      this._subtitleSubject.asObservable(),
      this.translate.stream(KsiTitleService.KEY_TITLE_SHORT),
      this.translate.stream(KsiTitleService.KEY_TITLE_LONG)
    ]).subscribe(() => {
      this.title.setTitle(
        `${this.translate.instant(KsiTitleService.KEY_TITLE_SHORT)} - ${this.translate.instant(
          this._subtitle ? this._subtitle : KsiTitleService.KEY_TITLE_LONG
        )}`
      );
    });
  }
}
