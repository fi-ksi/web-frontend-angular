import { Component, OnInit, ChangeDetectionStrategy} from '@angular/core';
import { Observable } from 'rxjs';
import { BackendService, KsiTitleService } from '../../../services';
import { map } from 'rxjs/operators';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'ksi-page-admin-monitor',
  templateUrl: './page-admin-monitor.component.html',
  styleUrls: ['./page-admin-monitor.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PageAdminMonitorComponent implements OnInit {
  src$: Observable<SafeResourceUrl>;

  constructor(private backend: BackendService, private sanitizer: DomSanitizer, private title: KsiTitleService) { }

  ngOnInit(): void {
    this.title.subtitle = 'admin.root.monitor.title';

    this.src$ = this.backend.http.adminMonitoringDashboardURL().pipe(map(
      (r) => this.sanitizer.bypassSecurityTrustResourceUrl(r.url)
    ));
  }
}
