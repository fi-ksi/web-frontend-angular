import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'ksiDate'
})
export class KsiDatePipe implements PipeTransform {

  transform(value: string, ...args: unknown[]): string {
    const valueDate = new Date(value);
    const offsetInHours = - valueDate.getTimezoneOffset() / 60;
    const correctTime = valueDate.setHours(valueDate.getHours() + offsetInHours);
    return new Date(correctTime).toLocaleString();
  }

}
