import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { BackendService, IconService, ModalService, RoutesService, YearsService } from '../../../services';
import { Achievement, DefaultService } from '../../../../api/backend';
import { AdminBaseComponent } from '../base/admin-base.component';
import { AdminWavesService } from 'src/app/services/admin/admin-waves.service';
import { map } from 'rxjs/operators';
import { AdminAchievementsService } from 'src/app/services/admin/admin-achievements.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'ksi-page-admin-achievements',
  templateUrl: './page-admin-achievements.component.html',
  styleUrls: ['./page-admin-achievements.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class PageAdminAchievementsComponent extends AdminBaseComponent<Achievement> {
  persistent$: Observable<Achievement[]>;
  yearly$: Observable<Achievement[]>;

  loadItemsFunction = () => {
    let allItems = this.achievementsService.getAchievements();
    this.persistent$ = allItems.pipe(map(achievements => achievements.filter(achievement => achievement.persistent)));
    this.yearly$ = allItems.pipe(map(achievements => achievements.filter(achievement => !achievement.persistent)));
    return allItems;
  };
  deleteFunction = (itemId: number) => this.achievementsService.deleteAchievement(itemId);

  constructor(
    public icon: IconService,
    public routes: RoutesService,
    public years: YearsService,
    public achievementsService: AdminAchievementsService,
    public backendService: BackendService,
    protected cdr: ChangeDetectorRef,
    protected modal: ModalService,
    protected defaultService: DefaultService,
    protected adminWavesService: AdminWavesService
  ) {
    super(modal, cdr);
  }
  
  ngOnInit(): void {
    super.ngOnInit();
  }
}
