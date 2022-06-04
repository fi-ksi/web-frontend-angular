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

  constructor(
    size: number,
    fetchNew?: CacheFetchFunction<K, V>,
  ) {
    this.size = size;
    this.fetchNew = fetchNew;
  }

  public set(key: K, value: V, publishUpdate = true): void {
    const iKey = this.getInternalKey(key);

    if (!(iKey in this.cacheAccessTime)) {
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

    const initial$: Observable<V> = of(true).pipe(
      mergeMap(() => {
        if (iKey in this.cacheAccessTime) {
          this.updateAccessTime(iKey);
          return of(this.cache[iKey]);
        } else if(this.fetchNew !== undefined) {
          return this.fetchNew(key).pipe(
            take(1),
            tap((v) => this.set(key, v, false))
          );
        } else {
          throw new Error(`Cache item '${key}' accessed, but not cached nor auto-cacheable`);
        }
      })
    );

    const updates$: Observable<V> = this.update$.pipe(
      filter((k) => k !== null),
      filter((k) => k === iKey),
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      map((k) => this.cache[k!])
    );

    return concat(initial$, updates$);
  }

  public getOnce(key: K): Observable<V> {
    return this.get(key).pipe(take(1));
  }

  private getInternalKey(key: K): string {
    return `${key}`;
  }

  private updateAccessTime(key: string) {
    this.cacheAccessTime[key] = new Date();
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
