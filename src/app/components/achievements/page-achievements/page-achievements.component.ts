import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute } from "@angular/router";
import { AchievementService, KsiTitleService, RoutesService, YearsService } from "../../../services";
import { combineLatest, Observable } from "rxjs";
import { Achievement } from "../../../../api";
import { map, mergeMap, shareReplay } from "rxjs/operators";

@Component({
  selector: 'ksi-page-achievements',
  templateUrl: './page-achievements.component.html',
  styleUrls: ['./page-achievements.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PageAchievementsComponent implements OnInit {
  achievements$: Observable<Achievement[]>;

  constructor(
    private route: ActivatedRoute,
    public years: YearsService,
    private achievementsService: AchievementService,
    private title: KsiTitleService,
    public routes: RoutesService
  ) { }

  ngOnInit(): void {
    this.title.subtitle = 'achievements.title';

    this.achievements$ = combineLatest([this.route.params, this.years.selected$]).pipe(
      map(([params, year]) => ({achievementId: params.id ? Number(params.id) : null, year})),
      mergeMap(({achievementId, year}) => {
        if (achievementId === null) {
          return this.achievementsService.getAll(year!.id);
        } else {
          return this.achievementsService.getAchievement(achievementId).pipe(map((x) => [x]));
        }
      }),
      shareReplay(1)
    )
  }
}
