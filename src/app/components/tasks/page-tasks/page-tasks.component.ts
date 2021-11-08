import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { TasksService } from "../../../services";

@Component({
  selector: 'ksi-page-tasks',
  templateUrl: './page-tasks.component.html',
  styleUrls: ['./page-tasks.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PageTasksComponent implements OnInit {

  constructor(public tasks: TasksService) { }

  ngOnInit(): void {
  }

}
