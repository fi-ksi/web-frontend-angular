import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { Observable } from 'rxjs';
import { map, } from 'rxjs/operators';
import { Wave } from 'src/api/backend';
import { IconService, RoutesService, YearsService } from 'src/app/services';
import { AdminWavesService } from 'src/app/services/admin/admin-waves.service';

@Component({
  selector: 'ksi-page-admin-waves',
  templateUrl: './page-admin-waves.component.html',
  styleUrls: ['./page-admin-waves.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PageAdminWavesComponent implements OnInit {
  constructor(
    public icon: IconService,
    public routes: RoutesService,
    public years: YearsService,
    private cdr: ChangeDetectorRef,
    private adminWavesService: AdminWavesService
  ) { }

  waves$: Observable<Wave[]>;
  totalPoints$: Observable<number>;
  tasksCount$: Observable<number>;

  ngOnInit(): void {
    this.adminWavesService.getWaves();
    this.reloadWaves();

    this.totalPoints$ = this.waves$.pipe(
      map(waves => waves.reduce((sum, wave) => sum + (wave.sum_points || 0), 0))
    );

    this.tasksCount$ = this.waves$.pipe(
      map(waves => waves.reduce((count, wave) => count + (wave.tasks_cnt || 0), 0))
    );
  }

  reloadWaves() {
    console.log('Reloading waves...');
    this.waves$ = this.adminWavesService.getWaves().pipe(map(response => response.waves));
    this.cdr.markForCheck();
  }

  notImplemented(): void {
    alert(`Feature is not implemented yet.`);
  }

  deleteWave(wave: Wave): void {
    if (confirm(`Are you sure you want to delete wave "${wave.caption}"?`)) {
      this.adminWavesService.deleteWave(wave.id).subscribe({
        next: () => {
          this.reloadWaves();
        },
        error: (err) => {
          alert(`Error deleting wave: ${err?.message || err}`);
        }
      });
    }
  }

  waveIsReleased(wave: Wave): boolean {
    return new Date(wave.time_published!) < new Date();
  }

  waveHasTasks(wave: Wave): boolean {
    return wave.tasks_cnt > 0;
  }


}
