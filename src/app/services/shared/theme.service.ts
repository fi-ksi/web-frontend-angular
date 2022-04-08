import { Injectable } from '@angular/core';
import { StorageService } from "./storage.service";

type Theme = 'dark' | 'light';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private storage: StorageService;
  private static THEME_DEFAULT: Theme = 'light';

  constructor(private storageService: StorageService) {
    this.storage = this.storageService.open('theme');

    if (this.storage.get<Theme>('selected', 'light') === ThemeService.THEME_DEFAULT) {
      this.setLightTheme(false);
    } else {
      this.setDarkTheme(false);
    }
  }

  public setLightTheme(saveSelection = true): void {
    this.setTheme('light', saveSelection);
  }

  public setDarkTheme(saveSelection = true): void {
    this.setTheme('dark', saveSelection);
  }

  public setTheme(theme: Theme, saveSelection: boolean): void {
    const oldThemes = [];
    const {classList} = document.body;
    classList.forEach((cls) => {
      if (cls.startsWith('theme-')) {
        oldThemes.push(cls);
      }
    });
    classList.add(`theme-${theme}`);

    if(saveSelection) {
      this.storage.set<Theme>('selected', theme, ThemeService.THEME_DEFAULT);
    }
  }
}
