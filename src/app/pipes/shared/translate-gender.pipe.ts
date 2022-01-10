import { Pipe, PipeTransform } from '@angular/core';
import { TranslateService } from "@ngx-translate/core";
import { User } from "../../../api";

@Pipe({
  name: 'translateGender'
})
export class TranslateGenderPipe implements PipeTransform {
  constructor(private translate: TranslateService) {
  }

  transform(key: string, user: User): string {
    return `${this.translate.instant(`${key}.${user.gender}`)}`;
  }

}
