import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { BackendService, KsiTitleService, YearsService } from "../../../services";
import { Observable } from "rxjs";
import { Article, User } from "../../../../api";
import { map, switchMap } from "rxjs/operators";

@Component({
  selector: 'ksi-page-welcome',
  templateUrl: './page-welcome.component.html',
  styleUrls: ['./page-welcome.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PageWelcomeComponent implements OnInit {

  articles$: Observable<Article[]>;
  organisators$: Observable<User[]>;

  constructor(private title: KsiTitleService, private years: YearsService, private backend: BackendService) {}

  ngOnInit(): void {
    this.title.subtitle = null;
    this.articles$ = this.years.selected$.pipe(switchMap(() => {
      return this.backend.http.articlesGetAll(3).pipe(map((response) => response.articles));
    }));
    this.organisators$ = this.years.selected$.pipe(switchMap(() => {
      return this.backend.http.usersGetAll('organisators', 'score').pipe(map((response) => response.users));
    }));
  }

}
