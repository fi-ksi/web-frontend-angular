import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { TasksService } from "../../../services";
import { WaveDetails } from "../../../models";
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

  private readonly storageWaves = this.storageRoot.open(['tasks', 'waves']);

  private static readonly WAVE_OPENED_DEFAULT = true;

  constructor(private tasks: TasksService, private storageRoot: StorageService) { }

  ngOnInit(): void {
    this.nonEmptyWaves$ = this.tasks.waveDetails$.pipe(
      map((waves) => waves
        .filter((wave) => wave.tasks.length > 0)
        .map((wave) => ({
          ...wave,
          opened: this.wageStorage(wave).get<boolean>('opened', PageTasksComponent.WAVE_OPENED_DEFAULT)!
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
      this.wageStorage(wave).delete('opened');
    } else {
      this.wageStorage(wave).set<boolean>('opened', opened);
    }
  }

  private wageStorage(wave: Wave): StorageService {
    return this.storageWaves.open(`${wave.id}`);
  }
}
