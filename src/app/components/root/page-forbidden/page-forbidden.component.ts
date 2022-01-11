import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { Observable, of } from "rxjs";
import { ActivatedRoute } from "@angular/router";
import { KsiTitleService } from "../../../services";

@Component({
  selector: 'ksi-page-forbidden',
  templateUrl: './page-forbidden.component.html',
  styleUrls: ['./page-forbidden.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PageForbiddenComponent implements OnInit {
  path$: Observable<string | null>;
  host$: Observable<string>;

  constructor(private route: ActivatedRoute, private title: KsiTitleService) { }

  ngOnInit(): void {
    this.host$ = of(`${location.protocol}//${location.host}`);
    this.path$ = this.route.fragment;

    this.title.subtitle = 'root.forbidden.title';
  }

}
