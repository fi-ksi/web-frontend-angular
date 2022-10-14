import { Pipe, PipeTransform } from '@angular/core';
import {DatePipe} from '@angular/common';

@Pipe({
  name: 'ksiDate'
})
export class KsiDatePipe implements PipeTransform {

  transform(value: string, ...args: any[]): string | null {
    const valueDate = new Date(value);
    const offsetInHours = - valueDate.getTimezoneOffset() / 60;
    const correctTime = valueDate.setHours(valueDate.getHours() + offsetInHours);
    return new DatePipe('cs_CZ').transform(correctTime, ...args);
  }

}
