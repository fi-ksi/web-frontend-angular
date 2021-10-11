import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { KsiTitleService, YearsService } from "../../../services";
import { User } from "../../../../api";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";

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

  constructor(private years: YearsService, private title: KsiTitleService) { }

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
        return users.map((user) => ({
          ...user,
          position: 'TBD'
        }));
      })
    );
  }

}
