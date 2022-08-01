import { Component, OnInit, ChangeDetectionStrategy, Input } from '@angular/core';
import { RoutesService, UsersCacheService } from '../../../services';
import { Observable } from 'rxjs';
import { IUser } from '../../../models';

@Component({
  selector: 'ksi-clickable-user-name',
  templateUrl: './clickable-user-name.component.html',
  styleUrls: ['./clickable-user-name.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ClickableUserNameComponent implements OnInit {
  @Input()
  userId: number;

  user$: Observable<IUser>;

  constructor(private users: UsersCacheService, public routes: RoutesService) { }

  ngOnInit(): void {
    this.user$ = this.users.getUser(this.userId);
  }

}
