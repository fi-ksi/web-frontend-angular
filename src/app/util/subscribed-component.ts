import { Component, OnDestroy } from '@angular/core';
import { Observable, Subscription } from 'rxjs';

@Component({
  template: ''
})
export abstract class SubscribedComponent implements OnDestroy {
  private _subs: Subscription[] = [];

  /**
   * Unsubscribes all subscriptions
   */
  ngOnDestroy(): void {
    this._subs.forEach((s) => s.unsubscribe());
  }

  /**
   * Add new subscription to the list of locally subscribed components
   *
   * @param observable observable to subscribe to
   * @param observer observer passed to the subscription
   * @protected
   */
  protected subscribe<T>(observable: Observable<T>, observer?: (value: T) => unknown): Subscription {
    const sub = observable.subscribe(observer);
    this._subs.push(sub);
    return sub;
  }
}
