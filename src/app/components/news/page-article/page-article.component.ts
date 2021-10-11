import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { BackendService, KsiTitleService } from "../../../services";
import { ActivatedRoute } from "@angular/router";
import { map, mergeMap, tap } from 'rxjs/operators';
import { ArticleResponse } from "../../../../api";
import { Observable } from "rxjs";
import { Utils } from "../../../util";

@Component({
  selector: 'ksi-page-article',
  templateUrl: './page-article.component.html',
  styleUrls: ['./page-article.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PageArticleComponent implements OnInit {

  articleResponse$: Observable<ArticleResponse>;

  constructor(private backend: BackendService, private route: ActivatedRoute, private title: KsiTitleService) { }

  ngOnInit(): void {
    this.articleResponse$ = this.route.params.pipe(
      mergeMap((params) => this.backend.http.articlesGetSingle(Number(params.id))),
      map((response) =>
        ({...response, article: {...response.article, picture: Utils.parseLegacyAssetsUrl(response.article.picture)}})
      ),
      tap((response) => {
        this.title.subtitle = response.article.title;
      })
    );
  }
}
