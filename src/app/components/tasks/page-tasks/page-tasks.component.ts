import { Component, OnInit, ChangeDetectionStrategy, ViewChild, TemplateRef } from '@angular/core';
import { KsiTitleService, ModalService, TasksService, WindowService, StorageService } from '../../../services';
import { WaveDetails, WaveView } from '../../../models';
import { combineLatest, concat, Observable, of } from 'rxjs';
import { map, shareReplay, tap } from 'rxjs/operators';
import { Wave } from '../../../../api/backend';
import { FormControl } from '@angular/forms';

interface WaveOpened extends WaveDetails {
  opened: boolean;
}

@Component({
  selector: 'ksi-page-tasks',
  templateUrl: './page-tasks.component.html',
  styleUrls: ['./page-tasks.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PageTasksComponent implements OnInit {
  nonEmptyWaves$: Observable<WaveOpened[]>;

  viewMode$: Observable<WaveView>;

  @ViewChild('modalSettings', {static: true})
  modalSettings: TemplateRef<unknown>;

  private readonly storageWaves = this.storageRoot.open(['tasks', 'waves']);

  splitWavesControl = new FormControl();

  private static readonly WAVE_OPENED_DEFAULT = false;
  private static readonly WAVE_GRAPH_SPLIT_DEFAULT = true;

  constructor(
    public tasks: TasksService,
    private storageRoot: StorageService,
    private title: KsiTitleService,
    public window: WindowService,
    private modal: ModalService
  ) { }

  ngOnInit(): void {
    this.title.subtitle = 'tasks.title';
    this.viewMode$ = combineLatest([
      this.window.isMobile$,
      concat(
        of(
          this.storageWaves.get<boolean>('split-waves', PageTasksComponent.WAVE_GRAPH_SPLIT_DEFAULT)
        ).pipe(tap((splitWaves) => this.splitWavesControl.setValue(splitWaves)), shareReplay(1)),
        this.splitWavesControl.valueChanges.pipe(tap((splitWaves: boolean) => {
          if (splitWaves === PageTasksComponent.WAVE_GRAPH_SPLIT_DEFAULT) {
            this.storageWaves.delete('split-waves');
          } else {
            this.storageWaves.set<boolean>('split-waves', splitWaves);
          }
        }))
      )
    ]).pipe(
      map(([isMobile, splitWaves]) => {
        if (isMobile) {
          return 'linear';
        }
        return splitWaves ? 'wave-graph' : 'graph';
      })
    );
    this.nonEmptyWaves$ = this.tasks.waveDetails$.pipe(
      map((waves) => waves
        .filter((wave) => wave.tasks.length > 0)
        .map((wave) => ({
          ...wave,
          opened: this.waveStorage(wave).get<boolean>(
            'opened', PageTasksComponent.WAVE_OPENED_DEFAULT || wave.index === 0
          )!
        }))
      )
    );
  }

  waveOpenChanged(wave: WaveOpened, opened: boolean): void {
    if (wave.opened === opened) {
      return;
    }
    wave.opened = opened;
    if (opened === PageTasksComponent.WAVE_OPENED_DEFAULT && wave.index !== 0) {
      this.waveStorage(wave).delete('opened');
    } else {
      this.waveStorage(wave).set<boolean>('opened', opened);
    }
  }

  /**
   * Unique storage for given Wave
   * @param wave
   * @private
   */
  private waveStorage(wave: Wave): StorageService {
    return this.storageWaves.open(`${wave.id}`);
  }

  showSettings(): void {
    this.modal.showModalTemplate(this.modalSettings, 'tasks.settings.title');
  }
}
