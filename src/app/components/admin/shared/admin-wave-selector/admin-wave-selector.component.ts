import {Component, OnInit, ChangeDetectionStrategy, Output, EventEmitter, Input} from '@angular/core';
import {BehaviorSubject, combineLatest, Observable, Subject} from 'rxjs';
import {distinctUntilChanged, map, mergeMap, take, tap} from 'rxjs/operators';
import {SubscribedComponent} from '../../../../util';
import {ActivatedRoute, Router} from '@angular/router';
import {Wave} from '../../../../../api/backend';
import {TasksService, YearsService} from '../../../../services';

@Component({
  selector: 'ksi-admin-wave-selector',
  templateUrl: './admin-wave-selector.component.html',
  styleUrls: ['./admin-wave-selector.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdminWaveSelectorComponent extends SubscribedComponent implements OnInit {
  private waveFilterSubj: Subject<number | null> = new BehaviorSubject<number | null>(null);
  readonly waveFilter$: Observable<number | null> = this.waveFilterSubj.asObservable();

  @Input()
  allowAll = true;

  waves$: Observable<Wave[]>;

  @Output()
  waveFilter = new EventEmitter<number | null>();

  constructor(private router: Router, private route: ActivatedRoute,
              private year: YearsService, private tasks: TasksService) {
    super();
  }

  ngOnInit(): void {
    this.subscribe(this.route.queryParams.pipe(
      map(params => params['wave']),
      map((waveId) => isNaN(+waveId) ? null : +waveId),
      distinctUntilChanged(),
      tap((waveId) => this.waveFilterSubj.next(waveId))
    ));

    this.waves$ = this.year.adminTasks$.pipe(
      map((tasks) => tasks.map(task => task.wave)),
      map(waves => Array.from(new Set(waves))),
      mergeMap((waveIds) =>  combineLatest(
        waveIds.map((waveId) => this.tasks.cacheWaves.get(waveId))
      ))
    );

    this.subscribe(this.waveFilter$.pipe(
      distinctUntilChanged(),
      tap((waveId) => this.waveFilter.emit(waveId))
    ));

    if (!this.allowAll) {
      combineLatest([this.waves$, this.waveFilter$])
        .pipe(take(1)).subscribe(([waves, selected]) => {
          if (selected === null) {
            this.waveFilterSubj.next(waves[0].id);
          }
        });
    }
  }

  filterWave(event: Event): Promise<boolean> {
    const waveId = +(event.target as HTMLSelectElement).value;

    return this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { wave: waveId === -1 ? null : waveId },
      queryParamsHandling: 'merge' // Merge with existing query params
    });
  }
}
