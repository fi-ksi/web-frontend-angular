import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import {
  BackendService,
  IconService,
  KsiTitleService,
  UsersCacheService,
  WindowService,
  YearsService,
  UserService, TasksService, AddressService
} from '../../../services';
import { ActivatedRoute, Router } from '@angular/router';
import { combineLatest, Observable, of } from 'rxjs';
import { map, mergeMap, shareReplay, tap } from 'rxjs/operators';
import {IUser, TaskIDWithScore, TaskWithIcon, UserProgress, WaveScore} from '../../../models';
import { BarValue } from 'ngx-bootstrap/progressbar/progressbar-type.interface';
import { ROUTES } from '../../../../routes/routes';
import { ProfileResponse } from '../../../../api';
import { TranslateService } from '@ngx-translate/core';
import {IPrediction} from '../../../models/prediction';

@Component({
  selector: 'ksi-page-profile',
  templateUrl: './page-profile.component.html',
  styleUrls: ['./page-profile.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PageProfileComponent implements OnInit {
  user$: Observable<IUser>;

  userSeasonsString$: Observable<string>;

  userProgress$: Observable<UserProgress[]>;

  tasksWithScore$: Observable<TaskIDWithScore[]>;

  prediction$: Observable<IPrediction | null>;

  readonly countries = AddressService.COUNTRIES;

  constructor(
    public userService: UserService,
    private backend: BackendService,
    private users: UsersCacheService,
    private route: ActivatedRoute,
    private router: Router,
    private title: KsiTitleService,
    public years: YearsService,
    public window: WindowService,
    public icon: IconService,
    private tasks: TasksService,
    private translate: TranslateService
  ) {
  }

  ngOnInit(): void {
    this.user$ = combineLatest([this.route.params, this.years.selected$, this.userService.isLoggedIn$]).pipe(
      map(([params, year]) => ({userId: Number(params.id), year})),
      mergeMap(({userId, year}) => {
        if (userId && !isNaN(userId)) {
          return of({userId, year});
        } else {
          return this.userService.forceLogin$.pipe(
            mergeMap(() => this.backend.user$),
            tap((loggedUser) => this.router.navigate(['/', ROUTES.profile._, `${loggedUser?.id}`])),
            map((loggedUser) => ({userId: loggedUser?.id, year}))
          );
        }
      }),
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      mergeMap(({userId, year}) => this.users.getUser(userId!, year)),
      tap((user) => this.title.subtitle = user.first_name),
      shareReplay(1)
    );

    this.userSeasonsString$ = this.user$.pipe(
      map((user) => user.seasons ? user.seasons.map((x) => `${x}.`).join(', ') : '')
    );

    const profile$: Observable<ProfileResponse | null> = combineLatest([this.years.selectedFull$, this.user$, this.backend.user$, this.userService.isOrg$]).pipe(
      mergeMap(([year, selectedUser, loggedInUser, isOrg]) => {
        if (selectedUser.id !== loggedInUser?.id && !isOrg) {
          return of(null);
        }
        return isOrg ? this.backend.http.profileGetSingle(selectedUser.id, year?.id) : this.backend.http.profileGetMy(year?.id);
      }),
      tap((profile) => {
        if (profile) {
          profile.tasks.forEach((task) => this.tasks.updateTask(task));
        }
      }),
      shareReplay(1)
    );

    this.tasksWithScore$ = combineLatest([this.user$, profile$]).pipe(
      map(([user, profile]) => {
        if (user.$isOrg) {
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          return user.tasks!.map((taskId) => ({id: taskId}));
        }
        if (!profile) {
          return [];
        }
        return profile.taskScores.map((score) => ({id: score.task, score: score.score}));
      }),
      shareReplay(1)
    );

    const userYearProgress$: Observable<UserProgress> = combineLatest([this.years.selectedFull$, this.user$]).pipe(
      map(([year, user]) => ({
        title: this.translate.instant('profile.stats.whole-year'),
        tasksSolved: user.tasks_num,
        score: user.score,
        bars: PageProfileComponent.generateProgressBar(user.score, year?.sum_points || 0)
      }))
    );

    const userWavesProgress$: Observable<UserProgress[]> = combineLatest([this.tasksWithScore$, this.tasks.waves$]).pipe(
      mergeMap(([taskScores, waves]) => {
        if (!taskScores.length || !waves.length) {
          return of({});
        }

        const waveScore: WaveScore = {};
        const taskScoresById: {[taskId: number]: number} = {};
        waves.forEach((wave) => waveScore[wave.id] = {title: wave.caption, max: wave.sum_points, current: 0, solved: 0});
        taskScores.forEach((taskScore) => taskScoresById[taskScore.id] = taskScore.score || 0);

        return combineLatest([...taskScores.map((task) => this.tasks.getTaskOnce(task.id))]).pipe(
          map((tasks) => {
            tasks.forEach((task) => {
              if (task.wave in waveScore) {
                waveScore[task.wave].current += taskScoresById[task.id];
                switch (task.state) {
                case 'done':
                  waveScore[task.wave].solved += 1;
                  break;
                }
              }
            });

            return waveScore;
          })
        );
      }),
      map((waveScore: WaveScore) => {
        return Object.keys(waveScore).map((waveId) => {
          const wave = waveScore[Number(waveId)];
          return {
            title: wave.title,
            score: Math.round(10 * wave.current) / 10,
            tasksSolved: wave.solved,
            bars: PageProfileComponent.generateProgressBar(wave.current, wave.max)
          };
        }).filter((wave) => wave.tasksSolved > 0);
      }),
      shareReplay(1)
    );

    this.userProgress$ = combineLatest([userYearProgress$, userWavesProgress$]).pipe(
      map(([year, waves]) => [year, ...waves])
    );

    this.prediction$ = combineLatest([this.tasks.tasks$, this.userProgress$, this.years.selectedFull$]).pipe(
      map(([tasks, userProgress, year]) => {
        if (userProgress.length === 0){
          return null;
        }

        return PageProfileComponent.generatePrediction(tasks, userProgress[0], year?.sum_points || 0);
      })
    );
  }

  private static generateProgressBar(points: number, maxPoints: number, requiredPercentage = 60): BarValue[] {
    const currentPercentage = Math.round(100 * points / maxPoints);
    const leftRequiredPercentage = Math.max(0, requiredPercentage - currentPercentage);
    const currentUserPercentageFloored = Math.floor(currentPercentage);

    return [
      {
        type: leftRequiredPercentage <= 0 ? 'success' : 'warning',
        value: currentPercentage,
        max: 100,
        label: currentPercentage >= 50 ? `${currentUserPercentageFloored}%` : ''
      },
      {
        type: 'info',
        value: leftRequiredPercentage,
        max: 100,
        label: currentPercentage < 50 ? `${currentUserPercentageFloored}%` : ''
      }
    ];
  }

  /**
   * Returns prediction based on users progress for current year.
   *
   * @param tasks all available tasks
   * @param totalProgress users progress
   * @param maxScore max score possible
   */
  private static generatePrediction(tasks: TaskWithIcon[], totalProgress: UserProgress, maxScore: number): IPrediction {
    const currentPoints = totalProgress.score;

    let missedScore = 0;
    for (const task of tasks){
      const deadlineDate = new Date(task.time_deadline);
      const today = new Date();

      if (deadlineDate < today) {
        missedScore += task.max_score;
      }
    }

    const percentNeeded = (maxScore > 0) ? (60 - Math.floor(100 * currentPoints / maxScore)) : 60;

    return {percentFromTotalNeeded: percentNeeded, doable: missedScore <= (maxScore * 0.4)};
  }
}
