import { Pipe, PipeTransform } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Pipe({
  name: 'translateNewItems'
})
export class TranslateNewItemsPipe implements PipeTransform {
  constructor(private translate: TranslateService) {
  }

  transform(value: number): string {
    const key = 'new.' + (value === 1 ? 'single' : 'multiple');
    return `${value} ${this.translate.instant(key)}`;
  }

}
