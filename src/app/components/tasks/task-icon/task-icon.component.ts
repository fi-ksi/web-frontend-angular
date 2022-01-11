import { Component, OnInit, ChangeDetectionStrategy, Input } from '@angular/core';
import { TaskWithIcon } from "../../../models";
import { UserService } from "../../../services/shared/user.service";

@Component({
  selector: 'ksi-task-icon',
  templateUrl: './task-icon.component.html',
  styleUrls: ['./task-icon.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TaskIconComponent implements OnInit {
  @Input()
  task: TaskWithIcon;

  constructor(public user: UserService) { }

  ngOnInit(): void {
  }

}
