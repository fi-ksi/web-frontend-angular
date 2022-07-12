import { Component, ChangeDetectionStrategy, Input, ChangeDetectorRef, ElementRef, OnInit } from '@angular/core';
import { IUser, TaskPanel, TaskTipData } from '../../../../models';
import { UsersCacheService } from '../../../../services';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { ROUTES } from '../../../../../routes/routes';

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

  author$: Observable<IUser | null>;

  routes = ROUTES;

  constructor(public cd: ChangeDetectorRef, public el: ElementRef, public users: UsersCacheService) {
  }

  ngOnInit(): void {
    this.author$ = this.data?.author ?  this.users.getUser(this.data.author) : of(null);

    this.imageSrc$ = this.author$.pipe(
      map((u) => u ? u.profile_picture : 'assets/img/karlik_color.png')
    );
  }
}
