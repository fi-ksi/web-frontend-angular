import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private static PREFIX = 'KSI';
  private scope: string;

  /**
   * All keys defined under this scope
   */
  public get keys(): string[] {
    const r = [];
    const prefix = this.keyPath('');
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)!;
      if (key.startsWith(prefix)) {
        r.push(key.substring(prefix.length));
      }
    }
    return r;
  }

  constructor() {}

  /**
   * Open a new (sub)scope
   * @param scope
   */
  public open(scope: string | Array<string>): StorageService {
    if (!Array.isArray(scope)) {
      scope = [scope];
    }

    if (this.scope) {
      scope = [this.scope, ...scope];
    }

    const storage = new StorageService();
    storage.scope = scope.join('/');
    return storage;
  }

  /**
   * Get a value
   * @param key
   * @param defaultValue used if the key is not defined yet
   */
  public get<T>(key: string, defaultValue: T | null = null): T | null {
    const item = localStorage.getItem(this.keyPath(key));
    if (item === null) {
      return defaultValue;
    }
    return JSON.parse(item);
  }

  /**
   * Save value to a key
   * @param key key to set
   * @param value new value to set
   * @param defaultValue if set, then if this value matches set value, the value is deleted instead
   */
  public set<T>(key: string, value: T, defaultValue?: T): void {
    if (typeof defaultValue !== 'undefined' && value === defaultValue) {
      this.delete(key);
    } else {
      localStorage.setItem(this.keyPath(key), JSON.stringify(value));
    }
  }

  /**
   * Delete single key under this scope
   * @param key
   */
  public delete(key: string): void {
    localStorage.removeItem(this.keyPath(key));
  }

  // noinspection JSUnusedGlobalSymbols
  /**
   * Clear all keys under this scope
   */
  public clear(): void {
    this.keys.forEach((key) => this.delete(key));
  }

  private keyPath(key: string): string {
    return `${StorageService.PREFIX}/${this.scope}/${key}`;
  }
}
