import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { KsiTitleService, TasksService, WindowService } from "../../../services";
import { WaveDetails, WaveView } from "../../../models";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { StorageService } from "../../../services/shared/storage.service";
import { Wave } from "../../../../api";

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

  private readonly storageWaves = this.storageRoot.open(['tasks', 'waves']);

  private static readonly WAVE_OPENED_DEFAULT = true;

  constructor(
    public tasks: TasksService,
    private storageRoot: StorageService,
    private title: KsiTitleService,
    private window: WindowService
  ) { }

  ngOnInit(): void {
    this.title.subtitle = 'tasks.title';
    this.viewMode$ = this.window.isMobile$.pipe(map((isMobile) => isMobile ? "linear" : "graph"));
    this.nonEmptyWaves$ = this.tasks.waveDetails$.pipe(
      map((waves) => waves
        .filter((wave) => wave.tasks.length > 0)
        .map((wave) => ({
          ...wave,
          opened: this.waveStorage(wave).get<boolean>('opened', PageTasksComponent.WAVE_OPENED_DEFAULT)!
        }))
      )
    );
  }

  waveOpenChanged(wave: WaveOpened, opened: boolean): void {
    if (wave.opened === opened) {
      return;
    }
    wave.opened = opened;
    if (opened === PageTasksComponent.WAVE_OPENED_DEFAULT) {
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
}
