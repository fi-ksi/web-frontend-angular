import { Pipe, PipeTransform } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { User } from '../../../api/backend';

@Pipe({
  name: 'translateGender'
})
export class TranslateGenderPipe implements PipeTransform {
  constructor(private translate: TranslateService) {
  }

  // eslint-disable-next-line @typescript-eslint/ban-types
  transform(key: string, user: User, params?: Object): string {
    return `${this.translate.instant(`${key}.${user.gender}`, params)}`;
  }
}
