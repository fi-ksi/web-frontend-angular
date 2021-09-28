import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { KsiTitleService } from "../../../services/shared/ksi-title.service";

@Component({
  selector: 'ksi-page-welcome',
  templateUrl: './page-welcome.component.html',
  styleUrls: ['./page-welcome.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PageWelcomeComponent implements OnInit {

  constructor(private title: KsiTitleService) { }

  ngOnInit(): void {
    this.title.subtitle = null;
  }

}
