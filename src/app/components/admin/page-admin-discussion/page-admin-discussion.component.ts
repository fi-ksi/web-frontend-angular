import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import {BackendService, RoutesService, YearsService} from '../../../services';
import {BehaviorSubject, Observable, Subject} from 'rxjs';
import {Thread} from '../../../../api/backend';
import {distinctUntilChanged, filter, map, mergeMap} from 'rxjs/operators';

@Component({
  selector: 'ksi-page-admin-discussion',
  templateUrl: './page-admin-discussion.component.html',
  styleUrls: ['./page-admin-discussion.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PageAdminDiscussionComponent implements OnInit {
  waveFilterSubj: Subject<number | null> = new BehaviorSubject<number | null>(null);
  readonly waveFilter$: Observable<number | null> = this.waveFilterSubj.asObservable();

  threads$: Observable<Thread[]>;

  readonly routePrefix = `/${this.routes.routes.discussion}/`;

  constructor(private backend: BackendService, public years: YearsService, private routes: RoutesService) { }

  ngOnInit(): void {
    this.threads$ = this.waveFilter$.pipe(
      filter(waveId => waveId !== null),
      distinctUntilChanged(),
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      mergeMap(((waveId) => this.backend.http.threadsGetAll(waveId!, this.years.selected!.id))),
      map((threads) => threads.threads)
    );
  }

}
