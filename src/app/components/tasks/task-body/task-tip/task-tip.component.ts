import { Component, ChangeDetectionStrategy, Input, ChangeDetectorRef, ElementRef, OnInit } from '@angular/core';
import { TaskPanel, TaskTipData } from '../../../../models';
import { UsersCacheService } from '../../../../services';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'ksi-task-tip',
  templateUrl: './task-tip.component.html',
  styleUrls: ['./task-tip.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TaskTipComponent implements TaskPanel<TaskTipData>, OnInit {
  @Input()
  title: string;

  @Input()
  content: string;

  @Input()
  data: TaskTipData;

  imageSrc$: Observable<string>;

  constructor(public cd: ChangeDetectorRef, public el: ElementRef, public users: UsersCacheService) {
  }

  ngOnInit(): void {
    this.imageSrc$ = this.data?.author ?
      this.users.getUser(this.data.author).pipe(map((u) => u.profile_picture)) :
      of('assets/img/karlik_color.png');
  }
}
