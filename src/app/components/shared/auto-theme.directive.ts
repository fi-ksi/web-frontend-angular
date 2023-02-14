import { Directive, ElementRef, OnDestroy, OnInit } from '@angular/core';
import { ThemeService, Theme } from '../../services';
import { Subscription } from 'rxjs';

@Directive({
  selector: 'table[ksiTheme]'
})
export class AutoThemeDirective implements OnDestroy, OnInit {
  private subs: Subscription[] = [];

  private static readonly THEME_CLASSES: Map<Theme, string[]> = new Map<Theme, string[]>([
    ['dark', ['table-dark']],
    ['light', []]
  ]);

  constructor(private el: ElementRef, private theme: ThemeService) {}

  ngOnInit(): void {
    this.subs.push(this.theme.theme$.subscribe((theme) => {
      const {classList} = (this.el.nativeElement as HTMLElement);

      // remove all themed classes
      AutoThemeDirective.THEME_CLASSES
        .forEach((classes) => classes.forEach((cls) => classList.remove(cls)));

      // apply classes for this theme
      AutoThemeDirective.THEME_CLASSES.get(theme)?.forEach((cls) => classList.add(cls));
    }));
  }


  ngOnDestroy(): void {
    this.subs.forEach((s) => s.unsubscribe());
  }
}
