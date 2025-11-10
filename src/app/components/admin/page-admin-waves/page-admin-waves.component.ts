import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { Observable } from 'rxjs';
import { map, } from 'rxjs/operators';
import { Wave } from 'src/api/backend';
import { IconService, ModalService, RoutesService, YearsService } from 'src/app/services';
import { AdminWavesService } from 'src/app/services/admin/admin-waves.service';
import { AdminBaseComponent } from '../base/admin-base.component';

@Component({
  selector: 'ksi-page-admin-waves',
  templateUrl: './page-admin-waves.component.html',
  styleUrls: ['./page-admin-waves.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class PageAdminWavesComponent extends AdminBaseComponent<Wave> {
  loadItemsFunction = () => this.adminWavesService.getWaves().pipe(map(response => response.waves));
  deleteFunction = (itemId: number) => this.adminWavesService.deleteWave(itemId);

  totalPoints$: Observable<number>;
  tasksCount$: Observable<number>;

  constructor(
    public icon: IconService,
    public routes: RoutesService,
    public years: YearsService,
    protected cdr: ChangeDetectorRef,
    protected modal: ModalService,
    protected adminWavesService: AdminWavesService
  ) {
    super(modal, cdr);
  }

  ngOnInit(): void {
    super.ngOnInit();

    this.totalPoints$ = this.items.pipe(
      map(waves => waves.reduce((sum, wave) => sum + (wave.sum_points || 0), 0))
    );

    this.tasksCount$ = this.items.pipe(
      map(waves => waves.reduce((count, wave) => count + (wave.tasks_cnt || 0), 0))
    );
  }

  waveIsReleased(wave: Wave): boolean {
    return new Date(wave.time_published!) < new Date();
  }

  waveHasTasks(wave: Wave): boolean {
    return wave.tasks_cnt > 0;
  }
}
