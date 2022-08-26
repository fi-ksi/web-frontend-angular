import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { KsiTitleService, RoutesService, YearsService } from '../../../services';
import { User } from '../../../../api';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

interface PositionedUser extends User {
  position: string;
}

interface ResultsCategory {
  name: string;
  users$: Observable<PositionedUser[]>;
}

@Component({
  selector: 'ksi-page-results',
  templateUrl: './page-results.component.html',
  styleUrls: ['./page-results.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PageResultsComponent implements OnInit {

  categories: ResultsCategory[];

  constructor(private years: YearsService, private title: KsiTitleService, public routes: RoutesService) { }

  ngOnInit(): void {
    this.title.subtitle = 'results.title';
    this.categories = [
      {name: 'results.category.highschoolers', users$: PageResultsComponent.countPositions(this.years.usersHighSchool$)},
      {name: 'results.category.others', users$: PageResultsComponent.countPositions(this.years.usersOther$)},
    ];
  }

  private static countPositions(users$: Observable<User[]>): Observable<PositionedUser[]> {
    return users$.pipe(
      map((users) => {
        const scoresCount: {[score: number]: number} = {};
        const scores: number[] = [];
        const scorePositions: {[score: number]: {from: number, to: number}} = {};

        users.forEach((u) => {
          if (!(u.score in scoresCount)) {
            scores.push(u.score);
            scoresCount[u.score] = 0;
          }
          scoresCount[u.score] = scoresCount[u.score] + 1;
        });

        let previousEndingPos = 1;
        for (const score of scores) {
          scorePositions[score] = {
            from: previousEndingPos,
            to: previousEndingPos + scoresCount[score] - 1,
          };
          previousEndingPos = scorePositions[score].to + 1;
        }

        return users.map((user) => ({
          ...user,
          position:
            scorePositions[user.score].from === scorePositions[user.score].to ?
              `${scorePositions[user.score].from}.`
              : `${scorePositions[user.score].from}.-${scorePositions[user.score].to}.`,
        })).sort((a, b) => b.score - a.score);
      })
    );
  }
}
