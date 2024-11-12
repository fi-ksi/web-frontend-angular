import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import {BackendService, ModalService, YearsService} from '../../../services';
import {map} from 'rxjs/operators';
import {Achievement} from '../../../../api/backend';

@Component({
  selector: 'ksi-page-admin-achievements',
  templateUrl: './page-admin-achievements.component.html',
  styleUrls: ['./page-admin-achievements.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PageAdminAchievementsComponent implements OnInit {
  readonly achievementsYearly$ = this.years.achievements$.pipe(map(achievements => achievements.filter(achievement => achievement.persistent)));
  readonly achievementsPersistent$ = this.years.achievements$.pipe(map(achievements => achievements.filter(achievement => !achievement.persistent)));

  constructor(private backend: BackendService, private years: YearsService, private modal: ModalService) { }

  ngOnInit(): void {

  }

  editAchievement(achievement: Achievement) {

  }

  give(achievement: Achievement) {

  }

  deleteAchievement(achievement: Achievement): void {
    this.modal.yesNo('admin.achievements.delete.message', false).subscribe(result => {
      if (!result) {
        return;
      }

      this.backend.http.achievementsDeleteSingle(achievement.id).subscribe(() => {
        location.reload();
      });
    });
  }
}
