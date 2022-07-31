import { Component, OnInit, ChangeDetectionStrategy} from '@angular/core';
import { Observable } from 'rxjs';
import { BackendService } from '../../../services';
import { map } from 'rxjs/operators';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

@Component({
  selector: 'ksi-page-admin-monitor',
  templateUrl: './page-admin-monitor.component.html',
  styleUrls: ['./page-admin-monitor.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PageAdminMonitorComponent implements OnInit {
  src$: Observable<SafeUrl>;

  constructor(private backend: BackendService, private sanitizer: DomSanitizer) { }

  ngOnInit(): void {
    this.src$ = this.backend.http.adminMonitoringDashboardURL().pipe(map(
      (r) => this.sanitizer.bypassSecurityTrustResourceUrl(r.url)
    ));
  }

}
