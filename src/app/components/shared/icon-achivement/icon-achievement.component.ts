import { Component, OnInit, ChangeDetectionStrategy, Input } from '@angular/core';
import { AchievementService, RoutesService } from "../../../services";
import { Achievement } from "../../../../api/backend";
import { Observable } from "rxjs";

@Component({
  selector: 'ksi-icon-achievement',
  templateUrl: './icon-achievement.component.html',
  styleUrls: ['./icon-achievement.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class IconAchievementComponent implements OnInit {
  @Input()
  achievementId: number;

  achievement$: Observable<Achievement>;

  constructor(private achievementService: AchievementService, public routes: RoutesService) { }

  ngOnInit(): void {
    this.achievement$ = this.achievementService.getAchievement(this.achievementId);
  }

}
