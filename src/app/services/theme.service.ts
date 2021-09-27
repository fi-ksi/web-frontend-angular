import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {

  constructor() {
    console.log('compiled')
  }

  public setLightTheme() {
    this.setTheme('light');
  }

  public setDarkTheme() {
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
