import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { KsiTitleService } from '../../../services';

@Component({
  selector: 'ksi-page-privacy-policy',
  templateUrl: './page-privacy-policy.component.html',
  styleUrls: ['./page-privacy-policy.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PagePrivacyPolicyComponent implements OnInit {

  constructor(private title: KsiTitleService) { }

  ngOnInit(): void {
    this.title.subtitle = 'privacy-policy.title';
  }

}
