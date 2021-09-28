import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { KsiTitleService } from "../../../services";

@Component({
  selector: 'ksi-page-not-found',
  templateUrl: './page-not-found.component.html',
  styleUrls: ['./page-not-found.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PageNotFoundComponent implements OnInit {

  constructor(private title: KsiTitleService) { }

  ngOnInit(): void {
    this.title.subtitle = 'root.not-found.title';
  }
}
