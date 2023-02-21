import { Component, OnInit, ChangeDetectionStrategy, ViewChild, TemplateRef } from '@angular/core';
import {
  BackendService,
  IconService,
  KsiTitleService,
  UsersCacheService,
  WindowService,
  YearsService,
  UserService, TasksService, AddressService, DiplomasService, ModalService, AchievementService
} from '../../../services';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject, combineLatest, Observable, of } from 'rxjs';
import { map, mergeMap, shareReplay, take, tap } from 'rxjs/operators';
import { IUser, TaskIDWithScore, TaskWithIcon, UserProgress, WaveScore, IPrediction, IWave } from '../../../models';
import { BarValue } from 'ngx-bootstrap/progressbar/progressbar-type.interface';
import { ROUTES } from '../../../../routes/routes';
import { ProfileResponse, User } from '../../../../api/backend';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'ksi-page-profile',
  templateUrl: './page-profile.component.html',
  styleUrls: ['./page-profile.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PageProfileComponent implements OnInit {
  @ViewChild('modalDiploma', { static: true })
  modalDiploma: TemplateRef<unknown>;

  user$: Observable<IUser>;

  userSeasonsString$: Observable<string>;

  userProgress$: Observable<UserProgress[]>;

  tasksWithScore$: Observable<TaskIDWithScore[]>;

  prediction$: Observable<IPrediction | null>;

  hasSuccessfulTrophy$: Observable<boolean>;

  private readonly diplomaURLSubject = new BehaviorSubject<string | null>(null);
  readonly diplomaURL$ = this.diplomaURLSubject.asObservable();

  readonly countries = AddressService.COUNTRIES;

  constructor(
    public userService: UserService,
    public diplomaService: DiplomasService,
    private backend: BackendService,
    private users: UsersCacheService,
    private route: ActivatedRoute,
    private router: Router,
    private title: KsiTitleService,
    public years: YearsService,
    public window: WindowService,
    public icon: IconService,
    private tasks: TasksService,
    private translate: TranslateService,
    private modal: ModalService,
    private achievement: AchievementService
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
      mergeMap(({userId}) => this.users.getUser(userId!)),
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
        bars: PageProfileComponent.generateProgressBar(user.score, Math.max((year?.sum_points || 0), (year?.point_pad || 0)))
      }))
    );

    const userWavesProgress$: Observable<UserProgress[]> = combineLatest([this.tasksWithScore$, this.tasks.waves$]).pipe(
      mergeMap(([taskScores, waves]) => {
        if (!taskScores.length || !waves.length) {
          return of({});
        }
        const extendedWaves = this.tasks.mergeSimilarWaves(waves) as IWave[];
        const waveMap: {[waveId: number]: number} = {};
        const waveScore: WaveScore = {};
        const taskScoresById: {[taskId: number]: number} = {};

        extendedWaves.forEach((wave) => {
          waveScore[wave.id] = {title: wave.caption, max: wave.sum_points, current: 0, solved: 0};
          waveMap[wave.id] = wave.id;
          if (wave.$mergedWaveIds) {
            wave.$mergedWaveIds.forEach((waveId2) => waveMap[waveId2] = wave.id);
          }
        });
        taskScores.forEach((taskScore) => taskScoresById[taskScore.id] = taskScore.score || 0);

        return combineLatest([...taskScores.map((task) => this.tasks.getTaskOnce(task.id))]).pipe(
          map((tasks) => {
            tasks.forEach((task) => {
              const scoreKey = waveMap[task.wave];
              if (scoreKey in waveScore) {
                waveScore[scoreKey].current += taskScoresById[task.id];
                switch (task.state) {
                case 'done':
                  waveScore[scoreKey].solved += 1;
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

    this.prediction$ = combineLatest([this.tasks.tasks$, this.tasksWithScore$, this.userProgress$, this.years.selectedFull$]).pipe(
      map(([tasks, scores, userProgress, year]) => {
        if (userProgress.length === 0){
          return null;
        }

        return PageProfileComponent.generatePrediction(tasks, scores, userProgress[0], Math.max((year?.sum_points || 0), (year?.point_pad || 0)));
      })
    );

    this.hasSuccessfulTrophy$ = combineLatest([this.user$, this.achievement.getSpecialAchievement('successful')]).pipe(
      map(([user, achievement]) => user.achievements.indexOf(achievement.id) > -1)
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
   * @param scores the scores of all submitted tasks of this user
   * @param totalProgress users progress
   * @param maxScore max score possible
   */
  private static generatePrediction(tasks: TaskWithIcon[], scores: TaskIDWithScore[], totalProgress: UserProgress, maxScore: number): IPrediction {
    const currentPoints = totalProgress.score;
    // all tasks that the user has submitted (== are present inside the score array) and have undefined score are unpublished
    const unpublishedTaskIDs = new Set(scores.filter((task) => task.score === undefined).map((task) => task.id));
    const today = new Date();

    let missedScore = 0;
    for (const task of tasks){
      const deadlineDate = new Date(task.time_deadline);

      if (!unpublishedTaskIDs.has(task.id) && deadlineDate < today) {
        missedScore += task.max_score;
      }
    }

    const percentNeeded = (maxScore > 0) ? (60 - Math.floor(100 * currentPoints / maxScore)) : 60;

    return {percentFromTotalNeeded: percentNeeded, doable: missedScore <= (maxScore * 0.4)};
  }

  uploadDiploma(user: User, event: Event, diplomaUploadButton: HTMLButtonElement): void {
    const el: HTMLInputElement = event.target as HTMLInputElement;
    if (el.files === null) {
      return;
    }

    const file = el.files.item(0);
    if (file === null) {
      return;
    }

    this.modal.yesNo('profile.diploma.grant.confirmation').subscribe((answer) => {
      if (answer) {
        diplomaUploadButton.disabled = true;
        this.diplomaService.uploadDiploma(user, file);
      }
    });
  }

  showDiploma(): void {
    this.user$.pipe(
      mergeMap((user) => this.diplomaService.userDiplomaURL(user)),
      take(1)
    ).subscribe((diplomaURL) => {
      if (diplomaURL === undefined) {
        return;
      }

      this.diplomaURLSubject.next(diplomaURL);
      this.modal.showModalTemplate(this.modalDiploma, 'profile.diploma.modal.title', {class: 'modal-full-width modal-full-height'})
        .afterClose$.subscribe(() => this.diplomaURLSubject.next(null));
    });
  }

  grantSuccessfulTrophy(grantSuccessfulButton: HTMLButtonElement): void {
    grantSuccessfulButton.disabled = true;
    combineLatest([this.user$, this.achievement.getSpecialAchievement('successful')]).pipe(
      take(1),
      mergeMap(([user, achievement]) => combineLatest([of(user), this.backend.http.adminAchievementsGrant({
        users: [user.id],
        achievement: achievement.id,
        task: null
      })])),
      mergeMap(([user]) => this.users.cache.refresh(user.id))
    ).subscribe();
  }
}
