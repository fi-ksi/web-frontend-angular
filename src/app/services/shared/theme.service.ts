import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {

  public setLightTheme(): void {
    this.setTheme('light');
  }

  public setDarkTheme(): void {
    this.setTheme('dark');
  }

  public setTheme(themeName: string): void {
    const oldThemes = [];
    const {classList} = document.body;
    classList.forEach((cls) => {
      if (cls.startsWith('theme-')) {
        oldThemes.push(cls);
      }
    });
    classList.add(`theme-${themeName}`);
  }
}
