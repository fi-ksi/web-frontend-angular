import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { YearsService } from '../../../services';
import { AdminTask } from '../../../../api';
import { Observable } from 'rxjs';

@Component({
  selector: 'ksi-page-admin-tasks',
  templateUrl: './page-admin-tasks.component.html',
  styleUrls: ['./page-admin-tasks.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PageAdminTasksComponent implements OnInit {
  tasks$: Observable<AdminTask[]>;

  constructor(private years: YearsService) { }

  ngOnInit(): void {
    this.tasks$ = this.years.adminTasks$;
  }

}
