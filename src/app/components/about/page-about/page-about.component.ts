import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { KsiTitleService } from '../../../services';
import {ROUTES} from '../../../../routes/routes';

@Component({
  selector: 'ksi-page-about',
  templateUrl: './page-about.component.html',
  styleUrls: ['./page-about.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PageAboutComponent implements OnInit {

  public routes = ROUTES;

  constructor(private title: KsiTitleService) { }

  ngOnInit(): void {
    this.title.subtitle = 'about.title';
  }

}
