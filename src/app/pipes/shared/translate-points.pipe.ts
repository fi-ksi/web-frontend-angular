import { Pipe, PipeTransform } from '@angular/core';
import { TranslateService } from "@ngx-translate/core";

@Pipe({
  name: 'translatePoints'
})
export class TranslatePointsPipe implements PipeTransform {
  constructor(private translate: TranslateService) {
  }

  transform(value: number): string {
    const key = 'points.' + (value === 1 ? 'single' : value % 1 !== 0 ? 'part' : value === 0 || value > 4 ? 'a-lot' : 'a-few');
    return `${value} ${this.translate.instant(key)}`;
  }

}
