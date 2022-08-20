import { BehaviorSubject, concat, Observable, of } from 'rxjs';
import { filter, map, mergeMap, take, tap } from 'rxjs/operators';

export type CacheFetchFunction<K, V> = (key: K) => Observable<V>;

export class Cache<K, V> {
  private readonly size: number;
  private readonly cache: {[key: string]: V} = {};
  private readonly cacheAccessTime: {[key: string]: Date} = {};
  private readonly fetchNew?: CacheFetchFunction<K, V>;
  private readonly updateSubject = new BehaviorSubject<string | null>(null);
  private readonly update$ = this.updateSubject.asObservable();
  private readonly fetchingNow: {[internalKey: string]: {publishUpdate: boolean}} = {};

  constructor(
    size: number,
    fetchNew?: CacheFetchFunction<K, V>,
  ) {
    this.size = size;
    this.fetchNew = fetchNew;
  }

  public set(key: K, value: V, publishUpdate = true): void {
    const iKey = this.getInternalKey(key);

    if (!this.contains(key)) {
      this.shrink();
    }
    this.cache[iKey] = value;
    this.updateAccessTime(iKey);
    if (publishUpdate) {
      this.updateSubject.next(iKey);
    }
  }

  public get(key: K): Observable<V> {
    const iKey = this.getInternalKey(key);

    return of(true).pipe(
      mergeMap(() => {
        let initial$: Observable<V>;

        if (this.contains(key)) {
          this.updateAccessTime(iKey);
          initial$ = of(this.cache[iKey]);
        } else {
          initial$ = this.refresh(key, false);
        }

        return concat(initial$, this.getUpdatesFor(key));
      })
    );
  }

  public getOnce(key: K): Observable<V> {
    return this.get(key).pipe(take(1));
  }

  public getSync(key: K): V | undefined {
    const iKey = this.getInternalKey(key);
    return this.cache[iKey];
  }

  public contains(key: K): boolean {
    const iKey = this.getInternalKey(key);
    return iKey in this.cacheAccessTime;
  }

  public refresh(key: K, publishUpdate = true): Observable<V> {
    if (this.fetchNew !== undefined) {
      const iKey = this.getInternalKey(key);
      if (iKey in this.fetchingNow) {
        this.fetchingNow[iKey].publishUpdate = this.fetchingNow[iKey].publishUpdate || publishUpdate;
        return this.getUpdatesFor(key);
      }
      this.fetchingNow[iKey] = {publishUpdate};

      return this.fetchNew(key).pipe(
        take(1),
        tap((v) => {
          const { publishUpdate } = this.fetchingNow[iKey];
          delete this.fetchingNow[iKey];
          this.set(key, v, publishUpdate);
        })
      );
    } else {
      throw new Error(`Cache item '${key}' accessed, but not cached nor auto-cacheable`);
    }
  }

  public flush(): void {
    const keys = Object.keys(this.cacheAccessTime);
    keys.forEach((k) => {
      delete this.cache[k];
      delete this.cacheAccessTime[k];
    });
  }

  private getInternalKey(key: K): string {
    return `${key}`;
  }

  private updateAccessTime(key: string) {
    this.cacheAccessTime[key] = new Date();
  }

  private getUpdatesFor(key: K): Observable<V> {
    const iKey = this.getInternalKey(key);

    return this.update$.pipe(
      filter((k) => k !== null),
      filter((k) => k === iKey),
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      map((k) => this.cache[k!]),
    );
  }

  /**
   * Shrinks the cache size to the maximum enabled
   * @private
   */
  private shrink(): void {
    let keys: string[];
    while((keys = Object.keys(this.cacheAccessTime)).length > this.size) {
      let minAccessTime: Date | null = null;
      let minAccessTimeKey: string | null = null;

      for (const key of keys) {
        const accessTime = this.cacheAccessTime[key];
        if (minAccessTime === null || accessTime < minAccessTime) {
          minAccessTime = accessTime;
          minAccessTimeKey = key;
        }
      }

      if (minAccessTimeKey === null) {
        return;
      }

      delete this.cacheAccessTime[minAccessTimeKey];
      delete this.cache[minAccessTimeKey];
    }
  }
}
