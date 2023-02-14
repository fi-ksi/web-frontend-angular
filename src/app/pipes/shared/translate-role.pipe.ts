import { Pipe, PipeTransform } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { User } from '../../../api/backend';

@Pipe({
  name: 'translateRole'
})
export class TranslateRolePipe implements PipeTransform {
  constructor(private translate: TranslateService) {
  }

  transform(user: User): string {
    return `${this.translate.instant(`user.role.${user.role}.${user.gender}`)}`;
  }

}
