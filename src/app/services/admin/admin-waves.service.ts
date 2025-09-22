import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { EmptyDict, Wave, WaveCreate, WaveCreationRequest, WaveResponse, Waves, WaveUpdateRequest } from 'src/api/backend';
import { BackendService, YearsService } from '../shared';
import { map, switchMap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AdminWavesService {

  constructor(
    private backend: BackendService,
    private yearsService: YearsService
  ) { }

  public getWaves(): Observable<Waves> {
    return this.yearsService.selected$.pipe(
      switchMap(year => this.backend.http.wavesGetAll(year?.id))
    );
  }

  public createWave(wave: WaveCreationRequest): Observable<any> {
    return this.backend.http.wavesCreateNew(wave);
  }

  public deleteWave(waveId: number): Observable<EmptyDict> {
    return this.backend.http.wavesDeleteSingle(waveId);
  }

  public getWaveById(waveId: number): Observable<WaveResponse | undefined> {
    return this.backend.http.wavesGetSingle(waveId);
  }

  public updateWave(wave: WaveUpdateRequest, waveId: number): Observable<WaveResponse> {
    return this.backend.http.wavesUpdateSingle(wave, waveId);
  }


}
